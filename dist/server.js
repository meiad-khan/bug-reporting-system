

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config();
var config = {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  jwt_secret: env.JWT_SECRET
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config.database_url
});
var initDB = async () => {
  try {
    await pool.query(`
     CREATE TABLE IF NOT EXISTS users(
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     role VARCHAR(15) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     ) 
      `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(15) NOT NULL DEFAULT 'open' CHECK (status IN('open','in_progress', 'resolved')),
      reporter_id INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      CONSTRAINT check_description_length CHECK (LENGTH(description) >= 20)
      )
      `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
var AuthService = class {
  async createUserIntoDB(payload) {
    const { name, email, password, role } = payload;
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await pool.query(`
      INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING id, name, email, role, created_at, updated_at
      `, [name, email, hashedPassword, role]);
    return res.rows[0];
  }
  async validateUserFromDB(payload) {
    const { email, password: givenPassword } = payload;
    const res = await pool.query(`
     SELECT * FROM users WHERE email=$1 
      `, [email]);
    if (res.rowCount === 0) {
      return null;
    }
    const { password, ...user } = res.rows[0];
    const isMatch = await bcrypt.compare(givenPassword, password);
    return isMatch ? user : null;
  }
};
var auth_service_default = new AuthService();

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var signToken = (payload) => {
  const accesToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "1d"
  });
  return { accesToken };
};

// src/utils/sendResponse.ts
function sendResponse(res, { message, data, error, errors }, status = 200) {
  res.status(status).json({
    success: error ? false : true,
    message,
    data: error ? void 0 : data,
    errors: error ? errors : void 0
  });
}

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const user = await auth_service_default.createUserIntoDB(req.body);
    sendResponse(res, { message: "User registered successfully", data: user }, 201);
  } catch (error) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500
    );
  }
};
var loginUser = async (req, res) => {
  try {
    const user = await auth_service_default.validateUserFromDB(req.body);
    if (!user) {
      return sendResponse(res, { message: "Wrong password or email", error: true, errors: "Invalid credential" }, 404);
    }
    const { id, name, role } = user;
    const { accesToken: token } = signToken({ id, name, role });
    sendResponse(res, {
      message: "Login successful",
      data: {
        token,
        user
      }
    });
  } catch (error) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500
    );
  }
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", createUser);
router.post("/login", loginUser);
var authRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
import "process";
var IssueService = class {
  async createIssue(payload, rep_id) {
    const { title: title2, description, type, status } = payload;
    const res = await pool.query(`
      INSERT INTO issues(title, description, type, status, reporter_id)
      VALUES($1, $2, $3, COALESCE($4, 'open'), $5) RETURNING *
      `, [title2, description, type, status, rep_id]);
    return res.rows[0];
  }
  async getAllIssuesFromDB(query) {
    const { sort = "newest", type, status } = query;
    let sql = `SELECT * FROM issues`;
    let conditions = [];
    let values = [];
    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }
    if (sort === "oldest") {
      sql += ` ORDER BY created_at ASC`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }
    const issues = await pool.query(sql, values);
    const reporterIds = issues.rows.map((issue) => issue.reporter_id);
    const users = await pool.query(`
      SELECT id, name, role FROM users
      WHERE id=ANY($1)
      `, [reporterIds]);
    const issueFormat = issues.rows.map((issue) => {
      const reporter = users.rows.find((user) => user.id === issue.reporter_id);
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: {
          id: reporter?.id,
          name: reporter?.name,
          role: reporter?.role
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
    });
    return issueFormat;
  }
  async getSingleIssueFromDB(id) {
    const res = await pool.query(`
      SELECT * FROM issues WHERE id=$1
      `, [id]);
    const issue = res.rows[0];
    if (!issue) {
      return null;
    }
    const result = await pool.query(`
      SELECT id, name, role FROM users 
      WHERE id=$1
      `, [issue?.reporter_id]);
    const reporter = result.rows[0];
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter?.id,
        name: reporter?.name,
        role: reporter?.role
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  }
  async modifyIssue(payload, id) {
    const result = await pool.query(`
      SELECT * FROM issues WHERE id=$1
      `, [id]);
    const issue = result.rows[0];
    const { title: title2, description, type } = payload;
    const res = await pool.query(
      `
      UPDATE issues
      SET title =COALESCE($1,title),
      description=COALESCE($2, description),
      type=COALESCE($3, type)
      WHERE id=$4 RETURNING *
      `,
      [title2, description, type, id]
    );
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }
  async deleteIssueFromDB(id) {
    const res = await pool.query(`
      DELETE FROM issues
      WHERE id=$1 RETURNING *
      `, [id]);
    return res.rowCount ? true : false;
  }
};
var issue_service_default = new IssueService();

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const issue = await issue_service_default.createIssue(req.body, req.user.id);
    if (!issue) {
      sendResponse(
        res,
        { message: "Invalid token", error: true, errors: "Your token is not valid" },
        401
      );
    }
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500
    );
  }
};
var getAllIssues = async (req, res) => {
  try {
    const issues = await issue_service_default.getAllIssuesFromDB(req.query);
    return sendResponse(
      res,
      {
        message: "Issues retrived successfully",
        data: issues
      },
      200
    );
  } catch (error) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500
    );
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issueId = Number(id);
    const issue = await issue_service_default.getSingleIssueFromDB(issueId);
    if (!issue) {
      return sendResponse(
        res,
        {
          message: "Issue not found",
          error: true,
          errors: "No issue exists with this ID"
        },
        404
      );
    }
    sendResponse(res, { message: "Issue retrieved successfully", data: issue });
  } catch (error) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500
    );
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const paramId = Number(id);
    const updatedIssue = await issue_service_default.modifyIssue(
      req.body,
      paramId
    );
    if (!updatedIssue) {
      sendResponse(
        res,
        {
          message: "Issue not found",
          error: true,
          errors: "No issue exists with this ID"
        },
        404
      );
    }
    sendResponse(res, { message: "Issue updated successfully", data: updatedIssue });
  } catch (error) {
    sendResponse(res, { message: "Something went wrong", error: true, errors: error }, 500);
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const paramId = Number(id);
    const result = await issue_service_default.deleteIssueFromDB(paramId);
    if (!result) {
      return sendResponse(res, { message: "Issue not found", error: true, errors: "No issue exists with this ID" }, 404);
    }
    sendResponse(res, { message: "Issue deleted successfully" });
  } catch (error) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500
    );
  }
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse(
          res,
          {
            message: "Token isn't found",
            error: true,
            errors: "Authorization token is missing in request headers"
          },
          401
        );
      }
      const decoded = jwt2.verify(
        token,
        config.jwt_secret
      );
      if (!roles.includes(decoded?.role)) {
        return sendResponse(
          res,
          {
            message: "Forbidden - you don't have permission",
            error: true,
            errors: "User role is not allowed to access this resource"
          },
          401
        );
      }
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt2.JsonWebTokenError) {
        return sendResponse(
          res,
          {
            message: "Invalid token",
            error: true,
            errors: "JWT signature is invalid or token is malformed"
          },
          401
        );
      }
      if (error instanceof jwt2.TokenExpiredError) {
        return sendResponse(
          res,
          {
            message: "Token expired",
            error: true,
            errors: "JWT token has expired, please login again"
          },
          401
        );
      }
      next(error);
    }
  };
};

// src/middleware/checkRole.ts
var checkRole = async (req, res, next) => {
  const { id } = req.params;
  const result = await pool.query(`
      SELECT * FROM issues WHERE id=$1
      `, [id]);
  const issue = result.rows[0];
  const user = req.user;
  if (user.role === "maintainer" || user.role === "contributor" && user.id === issue.reporter_id && issue.status === "open") {
    return next();
  }
  return sendResponse(
    res,
    {
      message: "Forbidden",
      error: true,
      errors: "You do not have permission to access this resource"
    },
    403
  );
};

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth("contributor", "maintainer"), createIssue);
router2.get("/", getAllIssues);
router2.get("/:id", getSingleIssue);
router2.put("/:id", auth("contributor", "maintainer"), checkRole, updateIssue);
router2.delete("/:id", auth("maintainer"), deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.get("/", (req, res) => {
  res.send("Server is running");
});

// src/server.ts
var main = () => {
  initDB();
  app.listen(3e3, () => {
    console.log(`Server is running at the port 3000`);
  });
};
main();
//# sourceMappingURL=server.js.map