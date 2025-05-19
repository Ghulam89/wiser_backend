const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ status: 'fail', message: 'No token provided' });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'TokenExpiredError', 
        message: 'Token expired, please login again' 
      });
    }
    console.error('JWT Verification Error:', err);
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Invalid token' 
    });
  }
};


const auditAction = async (action, resource, details, adminId) => {
  try {
    await db.auditLog.create({
      action,
      resource,
      details,
      adminId
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    
    await next();
    
    if (res.statusCode < 400) {
      let details = '';
      
      if (action === 'create') {
        details = `Created ${resource}: ${JSON.stringify(req.body)}`;
      } else if (action === 'update') {
        details = `Updated ${resource} ID ${req.params.id}: ${JSON.stringify(req.body)}`;
      } else if (action === 'delete') {
        details = `Deleted ${resource} ID ${req.params.id}`;
      }

      await auditAction(action, resource, details, req.admin?.id);
    }
  };
};

module.exports = {authenticate, auditAction, auditMiddleware};
