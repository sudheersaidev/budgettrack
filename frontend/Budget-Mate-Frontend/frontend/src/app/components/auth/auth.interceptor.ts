import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Retrieve the JWT token from where you stored it after login
  const token = localStorage.getItem('token'); 

  // If the token exists, clone the request and add the Authorization header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // If no token, pass the original request (e.g., for Login calls)
  return next(req);
};

