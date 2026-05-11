import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const onboardingGuard: CanActivateFn = () => {
  if (localStorage.getItem('melodia_onboarded')) return true;
  return inject(Router).createUrlTree(['/intro']);
};
