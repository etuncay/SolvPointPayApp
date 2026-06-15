import { setKycReviewsPort } from './kyc-reviews-service';
import { mockKycReviewsAdapter } from './mock-kyc-reviews-adapter';

setKycReviewsPort(mockKycReviewsAdapter);

export { kycReviewsService } from './kyc-reviews-service';
export { countOpenKycReviews } from './mock-kyc-reviews-adapter';
