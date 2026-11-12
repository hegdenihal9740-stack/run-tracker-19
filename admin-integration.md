# Connect the Admin website to Skill AI LMS

The LMS now reads real student profiles, assigned batches, recorded fee payments, leave applications, certificate applications and feedback from Lovable Cloud. Academic modules, materials, marks, attendance and assignments still need their own data integration; real accounts never show demo academic results.

## 1. Keep the shared key on the Admin server

Store `ADMIN_API_KEY` securely on the Admin server. Never put it in a `VITE_` variable, browser code, Git, or a public HTML page. The Admin browser calls its own server, and that server calls the LMS API.

Set `LMS_API_BASE_URL` on that server to the LMS published origin followed by `/api/public/admin`. Publish the LMS before using it from the Admin site. The editor preview URL is not a stable production integration URL.

```js
async function lmsAdmin(path, method = 'GET', body) {
  const response = await fetch(`${process.env.LMS_API_BASE_URL}/${path}`, {
    method,
    headers: { 'x-api-key': process.env.ADMIN_API_KEY, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'LMS request failed');
  return result;
}
```

## 2. Create an admission and invite the student

```js
const { data: student } = await lmsAdmin('students', 'POST', {
  student_code: registrationNumber,
  name: studentName,
  email: realStudentEmail,
  program: programName,
  batch_id: selectedBatchId,
  status: 'Active',
});
await lmsAdmin(`students/${student.id}/invite`, 'POST');
```

The student receives an invitation email, opens it, sets a password and signs in with their registration number or email. The invite creates a real sign-in account and links its ID to the admission. Saving a password in the Admin folder alone does not create an LMS sign-in account. Do not save student passwords in the students table.

If the email already has an account, invitation returns an error rather than replacing its password. Link the verified existing account ID through `PATCH students/<id>` using `user_id`; do not link an unverified identity.

## 3. Use the existing resources

| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| students | GET | POST | PATCH | DELETE |
| batches | GET | POST | PATCH | DELETE |
| fee-payments | GET | POST | — | DELETE |
| leave-requests | GET | student submits | PATCH | — |
| certificates | GET | student submits | PATCH | — |
| feedback | GET | student submits | PATCH | — |
| profiles | GET | automatic | PATCH | — |

```js
await lmsAdmin('fee-payments', 'POST', {
  student_id: studentId, amount: 2500, receipt_no: receiptNumber,
  payment_mode: 'UPI', paid_on: '2026-11-12', note: 'Instalment payment',
});
await lmsAdmin(`leave-requests/${leaveId}`, 'PATCH', {
  status: 'Approved', remark: 'Approved by the office',
});
await lmsAdmin(`certificates/${requestId}`, 'PATCH', {
  status: 'Issued', certificate_no: certificateNumber,
});
```

Lists accept `limit` (up to 200), `offset`, `search`, and the resource's allowed filters. Student profile details can be stored as `profiles/<user-id>` with `details` containing fields such as address or education. Academic identifiers, email and batch assignment come from the students record, not editable profile fields.

## 4. Test both apps

1. Create a real admission and send its invitation from Admin.
2. Open the invitation, set a password, and sign in to the LMS using the registration number.
3. Record a fee payment in Admin; reload the LMS Fees page and check the receipt and amount.
4. Submit leave in the LMS, approve it in Admin, then reload the LMS to see the decision.
5. Change batch or profile details in Admin; reload the LMS to check the shared record.

The API key alone must never grant direct browser database writes. Student reads and submissions remain protected by their signed-in account. Outstanding balances and certificate eligibility require fee schedules and academic completion data; recorded payments alone do not establish either.

The separate Admin folder must be uploaded before its screens and server calls can be implemented and tested here.