
import { z } from "zod";
import DOMPurify from "dompurify";

const sanitizeHtml = (val) => DOMPurify.sanitize(val);

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Invalid email format.").transform(sanitizeHtml),
  password: z.string().trim().min(1, "Password is required.") // Password shouldn't be HTML sanitized
});

export const employeeAddSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").transform(sanitizeHtml),
  email: z.string().trim().min(1, "Email is required.").email("Invalid email format.").transform(sanitizeHtml),
  phone: z.string().trim().regex(/^[\d\s+()-]+$/, "Invalid phone number.").or(z.literal("")).transform(val => val ? sanitizeHtml(val) : val),
  dateOfJoining: z.string().trim().min(1, "Date of Joining is required.").refine(
    (date) => !isNaN(new Date(date).getTime()),
    { message: "Invalid date." }
  ).transform(sanitizeHtml),
  password: z.string().trim().min(1, "Password is required."),
  designationId: z.string().trim().min(1, "Designation is required.").transform(sanitizeHtml),
  role: z.enum(["EMPLOYEE", "ADMIN"])
});

export const employeeEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").transform(sanitizeHtml),
  email: z.string().trim().min(1, "Email is required.").email("Invalid email format.").transform(sanitizeHtml),
  phone: z.string().trim().regex(/^[\d\s+()-]+$/, "Invalid phone number.").or(z.literal("")).transform(val => val ? sanitizeHtml(val) : val),
  dateOfJoining: z.string().trim().min(1, "Date of Joining is required.").refine(
    (date) => !isNaN(new Date(date).getTime()),
    { message: "Invalid date." }
  ).transform(sanitizeHtml),
  changePassword: z.boolean(),
  newPassword: z.string(),
  confirmNewPassword: z.string(),
  designationId: z.string().trim().min(1, "Designation is required.").transform(sanitizeHtml),
  role: z.enum(["EMPLOYEE", "ADMIN"])
}).superRefine((data, ctx) => {
  if (data.changePassword) {
    if (!data.newPassword.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password cannot be empty."
      });
    }
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Passwords do not match."
      });
    }
  }
});

export const assessmentSchema = z.object({
  title: z.string().trim().min(1, "Assessment title is required.").transform(sanitizeHtml),
  description: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
  courseName: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
  assessmentDate: z.string().optional().transform(val => val ? sanitizeHtml(val) : val),
  maximumMarks: z.string().min(1, "Maximum marks is required.").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Maximum marks must be a positive number." }
  ).transform(sanitizeHtml),
  assignedEmployeeIds: z.array(z.number()).min(1, "At least one employee must be assigned.")
});

export const certificateSchema = z.object({
  certificateName: z.string().trim().min(1, "Certificate name is required.").transform(sanitizeHtml),
  organization: z.string().trim().min(1, "Issuing organization is required.").transform(sanitizeHtml),
  issueDate: z.string().trim().min(1, "Issue date is required.").transform(sanitizeHtml),
  expiryDate: z.string().trim().optional().or(z.literal("")).transform(val => val ? sanitizeHtml(val) : val),
  certificateId: z.string().trim().optional().transform(val => val ? sanitizeHtml(val) : val),
  verificationUrl: z.string().trim().optional().or(z.literal("")).transform(val => val ? sanitizeHtml(val) : val),
}).superRefine((data, ctx) => {
  if (data.expiryDate && data.issueDate && data.expiryDate <= data.issueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiryDate"],
      message: "Expiry date must be after issue date."
    });
  }
  if (data.verificationUrl && !/^https?:\/\/.+/.test(data.verificationUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["verificationUrl"],
      message: "Must be a valid URL starting with http:// or https://"
    });
  }
});
