export type IdentityDocument = 'IdentityCard' | 'Passport' | 'ResidencePermit';
export type Gender = 'Male' | 'Female' | 'Other';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type EducationLevel =
  | 'Primary'
  | 'Secondary'
  | 'HighSchool'
  | 'Associate'
  | 'Bachelor'
  | 'Master'
  | 'Doctorate'
  | 'Other';
export type AddressType = 'Registered' | 'Home' | 'Work' | 'Contact' | 'Other';
export type EmploymentStatus = 'Active' | 'OnLeave' | 'Terminated';

export interface EmployeeAddressRow {
  id: number;
  addressType: AddressType;
  country: string;
  city: string;
  district: string;
  postcode: string;
  line: string;
}

export interface EmployeeContactRow {
  id: number;
  type: 'email' | 'phone';
  value: string;
  verified: boolean;
  primary: boolean;
}

export interface EmployeeDocumentRow {
  id: string;
  type: string;
  typeLabelKey: string;
  fileName: string;
  uploadedAt: string;
}

export interface EmployeeDetail {
  employeeId: string;
  personId: string;
  userNo: string | null;
  photoUrl: string | null;
  firstName: string;
  lastName: string;
  identityNo: string;
  identityDocument: IdentityDocument;
  title: string;
  departmentId: string;
  hireDate: string;
  nationality: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  maidenName: string | null;
  documentSerialNo: string | null;
  documentIssueDate: string | null;
  documentIssuedBy: string | null;
  documentExpiryDate: string | null;
  motherName: string | null;
  fatherName: string | null;
  educationLevel: EducationLevel;
  lastSchool: string | null;
  graduationYear: number | null;
  taxCountry: string;
  bankName: string | null;
  bankAccountNo: string | null;
  iban: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  employmentStatus: EmploymentStatus;
  addresses: EmployeeAddressRow[];
  contacts: EmployeeContactRow[];
  documents: EmployeeDocumentRow[];
  createdAt: string;
  updatedAt: string;
}

export type EmployeeFormMode = 'insert' | 'update' | 'view';

export type EmployeeFormValues = Omit<
  EmployeeDetail,
  'employeeId' | 'personId' | 'userNo' | 'createdAt' | 'updatedAt'
>;

export type DocumentUploadInput = {
  type: string;
  fileName: string;
};

export type EmployeeFormPermissions = {
  insert: boolean;
  update: boolean;
  view: boolean;
};
