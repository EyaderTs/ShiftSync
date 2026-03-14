import { NextFunction, Request, Response } from 'express';
import { EnumRoles } from '../domains/role/enum-roles';

interface AuthenticatedRequest extends Request {
  currentUser?: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    roles: string; // Comma-separated role keys
  };
}

export const RoleGuard = (allowedRoles: EnumRoles[] | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Authentication required. Please login first.',
          error: 'Unauthorized'
        });
      }

      // Get user roles from JWT payload
      const userRoles = req.currentUser.roles 
        ? req.currentUser.roles.split(',').map(role => role.trim()) 
        : [];

      // Convert allowed roles to strings for comparison
      const allowedRoleStrings = allowedRoles.map(role => 
        typeof role === 'string' ? role : String(role)
      );

      // Check if user has at least one of the required roles
      const hasRequiredRole = userRoles.some(userRole => 
        allowedRoleStrings.includes(userRole)
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: `Access denied, Contact your administrator`,
        
          //   message: `Access denied. Required roles: ${allowedRoleStrings.join(', ')}. Your roles: ${userRoles.join(', ') || 'none'}`,
          error: 'Forbidden'
        });
      }

      // User has required role, proceed to next middleware
      next();
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal server error during role validation',
        error: error.message || 'Internal Server Error'
      });
    }
  };
};


export const hasRole = (req: AuthenticatedRequest, role: EnumRoles | string): boolean => {
  if (!req.currentUser || !req.currentUser.roles) {
    return false;
  }

  const userRoles = req.currentUser.roles.split(',').map(r => r.trim());
  const roleString = typeof role === 'string' ? role : String(role);
  return userRoles.includes(roleString);
};


export const hasAnyRole = (req: AuthenticatedRequest, roles: (EnumRoles | string)[]): boolean => {
  if (!req.currentUser || !req.currentUser.roles) {
    return false;
  }

  const userRoles = req.currentUser.roles.split(',').map(r => r.trim());
  const roleStrings = roles.map(role => typeof role === 'string' ? role : String(role));
  
  return userRoles.some(userRole => roleStrings.includes(userRole));
};

export const getUserRoles = (req: AuthenticatedRequest): string[] => {
  if (!req.currentUser || !req.currentUser.roles) {
    return [];
  }

  return req.currentUser.roles.split(',').map(role => role.trim()).filter(role => role.length > 0);
}; 