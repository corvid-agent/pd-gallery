import { HttpInterceptorFn } from '@angular/common/http';

export const articInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('api.artic.edu')) {
    const cloned = req.clone({
      setHeaders: {
        'Accept': 'application/json',
      },
    });
    return next(cloned);
  }
  return next(req);
};
