
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** GIMRONAL
- **Date:** 2026-05-18
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Sign in and reach the dashboard
- **Test Code:** [TC001_Sign_in_and_reach_the_dashboard.py](./TC001_Sign_in_and_reach_the_dashboard.py)
- **Test Error:** TEST FAILURE

Logging in did not work — the email and password were not accepted.

Observations:
- The login page displayed a toast with the message 'Invalid login credentials'.
- The page remained on /login and did not navigate to the dashboard.
- The submit action was attempted but did not result in the dashboard or operational overview being shown.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/8c6cee72-9001-4c27-a2f7-93eef12c5eb9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Staff reaches the dashboard after signing in
- **Test Code:** [TC002_Staff_reaches_the_dashboard_after_signing_in.py](./TC002_Staff_reaches_the_dashboard_after_signing_in.py)
- **Test Error:** TEST BLOCKED

Valid admin credentials were not available, so the sign-in and dashboard verification could not be completed.

Observations:
- A toast notification displayed 'Error de Acceso' with the message 'Invalid login credentials'.
- The page remained on /login and no dashboard content or navigation was observed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/4e10fb3c-bad5-4187-819a-a851c4309339
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Staff registers a payment with a selected client and plan
- **Test Code:** [TC003_Staff_registers_a_payment_with_a_selected_client_and_plan.py](./TC003_Staff_registers_a_payment_with_a_selected_client_and_plan.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the staff user could not authenticate. Without a successful admin login the payment registration flow cannot be reached.

Observations:
- A visible toast shows 'Error de Acceso' with message 'Invalid login credentials'.
- The page remained on /login with the email and password fields visible after submitting.
- The login submit showed a processing attempt but ultimately returned to the login form.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/0879a19b-bfa4-425b-9d77-6aa94b3ed54e
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 View the dashboard overview after login
- **Test Code:** [TC004_View_the_dashboard_overview_after_login.py](./TC004_View_the_dashboard_overview_after_login.py)
- **Test Error:** TEST FAILURE

Signing in did not complete — the admin login submit remained in a processing/disabled state and the dashboard was not reached.

Observations:
- The login form is still visible and the submit button is disabled with the label 'Entrando...'
- Navigating to /dashboard did not display the dashboard; the app remained on the login screen

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/4f5dcb57-1a6f-4cda-be17-ea19dcdf6062
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Staff searches clients and sees filtered results
- **Test Code:** [TC005_Staff_searches_clients_and_sees_filtered_results.py](./TC005_Staff_searches_clients_and_sees_filtered_results.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the staff login could not be completed because the provided credentials were rejected.

Observations:
- The login page displayed a toast 'Invalid login credentials'.
- The page remained on the admin login screen and did not redirect to the dashboard.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/9a7d9580-3f9d-4735-9a89-0d811c2e4642
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Staff registers a new client
- **Test Code:** [TC006_Staff_registers_a_new_client.py](./TC006_Staff_registers_a_new_client.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI prevents reaching the clients module because staff authentication failed.

Observations:
- After submitting the admin credentials a toast appeared showing 'Error de Acceso' and 'Invalid login credentials'.
- The login page remained visible and access to the application's clients module was not reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/1725d0ac-bf95-4f82-8d35-4b171db016c8
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Staff records attendance through manual member lookup
- **Test Code:** [TC007_Staff_records_attendance_through_manual_member_lookup.py](./TC007_Staff_records_attendance_through_manual_member_lookup.py)
- **Test Error:** TEST BLOCKED

The test could not be run because login to the admin account failed with the credentials provided, preventing access to the attendance features required by the test.

Observations:
- After submitting the admin login form a toast appeared: "Error de Acceso - Invalid login credentials".
- The page remained on the login screen and no dashboard or attendance module was reachable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/79061ece-4048-41fa-9ebc-676f6b05e0d1
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Staff records attendance through QR scan when camera access is allowed
- **Test Code:** [TC008_Staff_records_attendance_through_QR_scan_when_camera_access_is_allowed.py](./TC008_Staff_records_attendance_through_QR_scan_when_camera_access_is_allowed.py)
- **Test Error:** TEST BLOCKED

The test could not be run — valid staff credentials are required to proceed but the provided credentials were rejected.

Observations:
- An error toast 'Invalid login credentials' was displayed.
- The login form remained on screen and the submit button showed 'Entrando...' (no successful navigation to the dashboard).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/f44d1f4c-a240-43e9-86a0-988abc63b72b
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Staff updates an existing client record
- **Test Code:** [TC009_Staff_updates_an_existing_client_record.py](./TC009_Staff_updates_an_existing_client_record.py)
- **Test Error:** TEST BLOCKED

The test could not be run — access to the admin area is required but the provided credentials were not accepted, preventing navigation to the Clients section and subsequent editing.

Observations:
- A toast on the login page displayed 'Error de Acceso: Invalid login credentials'.
- After submitting example@gmail.com / password123 the app remained on the login screen and did not navigate to the admin dashboard.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/f9f6cdb9-f0eb-4d63-b9b9-bce70163526c
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Register a supply sale and see quantities update
- **Test Code:** [TC010_Register_a_supply_sale_and_see_quantities_update.py](./TC010_Register_a_supply_sale_and_see_quantities_update.py)
- **Test Error:** TEST BLOCKED

The test could not be run — valid Admin (staff) credentials are not available, so login and subsequent inventory actions could not be performed.

Observations:
- An error toast is visible: 'Error de Acceso' / 'Invalid login credentials'.
- The Admin login form remains on the screen (email and password fields present) after submitting the credentials.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/7006cc96-c566-48b7-83ea-cf82d40e37cc
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 View current membership status in the member portal
- **Test Code:** [TC011_View_current_membership_status_in_the_member_portal.py](./TC011_View_current_membership_status_in_the_member_portal.py)
- **Test Error:** TEST BLOCKED

The test could not be run — valid member credentials are not available to access the protected member area.

Observations:
- Attempting to log in with example credentials produced an error: 'Error de Acceso: Documento o contraseña incorrectos'.
- Navigating directly to /socios redirects to the login page, indicating the member area is protected and requires valid credentials.
- The UI provides no alternative way to view a member's active membership status or expiration without signing in.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/442f062a-da3d-4945-8479-557bad84a0ec
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Staff creates a membership plan
- **Test Code:** [TC012_Staff_creates_a_membership_plan.py](./TC012_Staff_creates_a_membership_plan.py)
- **Test Error:** TEST BLOCKED

The test could not be run — admin login could not be completed because the provided credentials are not accepted and no alternate credentials were supplied.

Observations:
- A toast on the /login page displayed 'Error de Acceso' and 'Invalid login credentials'.
- The Admin email field contains 'example@gmail.com' and a password was entered, but the app remained on the login page.
- Two login attempts were performed and both failed, preventing access to the Plans module.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/fcd114b5-522b-4835-a622-bba6d2a93cfd
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Record a cash entry
- **Test Code:** [TC013_Record_a_cash_entry.py](./TC013_Record_a_cash_entry.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI prevented access to the administration area because login failed.

Observations:
- A toast was shown with "Error de Acceso" and the message "Invalid login credentials".
- The login form remained visible after submitting and the dashboard was not reached.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/4c889226-ab39-43a4-9ece-9f00d3669f6c
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Reject invalid login credentials
- **Test Code:** [TC014_Reject_invalid_login_credentials.py](./TC014_Reject_invalid_login_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/4c8d9cf3-c47f-47b5-af0e-e08b4f07ef6a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Create a membership plan
- **Test Code:** [TC015_Create_a_membership_plan.py](./TC015_Create_a_membership_plan.py)
- **Test Error:** TEST BLOCKED

The test could not be run — admin access is required but the provided credentials failed to authenticate.

Observations:
- The login page showed a toast: 'Error de Acceso\nInvalid login credentials'
- The admin login form remained visible after submitting the credentials

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/28602ac6-2262-45cf-9cf4-8ffed3696c47
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Review stock and low-stock warnings
- **Test Code:** [TC016_Review_stock_and_low_stock_warnings.py](./TC016_Review_stock_and_low_stock_warnings.py)
- **Test Error:** TEST BLOCKED

Login to the administrative panel could not be completed — the provided credentials are not accepted, preventing access to the inventory feature.

Observations:
- A toast is visible saying 'Error de Acceso' and 'Invalid login credentials'.
- The admin login form is shown with email prefilled (example@gmail.com) but access was denied.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/c27d1d92-9b49-42aa-bdbe-2a2b1990fdba
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Staff sees low-stock warnings and registers an inventory movement
- **Test Code:** [TC017_Staff_sees_low_stock_warnings_and_registers_an_inventory_movement.py](./TC017_Staff_sees_low_stock_warnings_and_registers_an_inventory_movement.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI did not allow completion of the login step so the inventory features could not be reached.

Observations:
- Clicking "Entrar al Gimnasio" repeatedly kept the page on the login screen with the Admin form visible.
- No error message or dashboard redirect was shown after multiple submit attempts.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/db54e261-2854-4bd8-83ad-a716abb61ff1
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Review class schedule and trainer shifts
- **Test Code:** [TC018_Review_class_schedule_and_trainer_shifts.py](./TC018_Review_class_schedule_and_trainer_shifts.py)
- **Test Error:** TEST BLOCKED

The test could not be run — access to the member area is blocked because the login was rejected and the portal could not be reached.

Observations:
- An error toast is visible: 'Documento o contraseña incorrectos'.
- The page remained on the member login screen and did not navigate to the dashboard.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/6f3c4c83-3b08-4c60-92b0-cb2fb092a0c0
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Record a cash exit
- **Test Code:** [TC019_Record_a_cash_exit.py](./TC019_Record_a_cash_exit.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI prevents proceeding because the staff/admin login failed and no valid credentials were provided to continue.

Observations:
- A toast message 'Invalid login credentials' was shown after submitting the admin login form.
- The page remained on the login screen and the dashboard was not reached.
- No alternative staff credentials were provided in the test inputs.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/43f130fa-b4b5-429c-a6c7-63ccce0e596b
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Review income and attendance metrics
- **Test Code:** [TC020_Review_income_and_attendance_metrics.py](./TC020_Review_income_and_attendance_metrics.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the staff login failed, preventing access to the dashboard and Reports module.

Observations:
- A toast notification appeared with title 'Error de Acceso' and message 'Invalid login credentials'.
- The admin login form remained visible and the dashboard was not reached, so Reports cannot be opened.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/604e142b-dedc-4bad-bfec-1581fa504fbc
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Staff checks trainer availability
- **Test Code:** [TC021_Staff_checks_trainer_availability.py](./TC021_Staff_checks_trainer_availability.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI does not allow access because the provided admin credentials are invalid and no valid credentials were supplied.

Observations:
- A top-right toast displays 'Error de Acceso' and 'Invalid login credentials'.
- The admin login form remains visible after submitting, preventing access to the dashboard and trainers module.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/ebae6dd9-6cba-4227-8209-9b69b87d5eb8
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Check recent attendance history
- **Test Code:** [TC022_Check_recent_attendance_history.py](./TC022_Check_recent_attendance_history.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the member area could not be reached because the login failed with invalid credentials.

Observations:
- The login form returned a toast: 'Error de Acceso - Documento o contraseña incorrectos'
- The page remained on the login screen (/login) and did not navigate to /socios
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/76f9b0a6-9fb0-4a18-b7da-f1e89d1e4e7c
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Staff reviews reports after recording cash activity
- **Test Code:** [TC023_Staff_reviews_reports_after_recording_cash_activity.py](./TC023_Staff_reviews_reports_after_recording_cash_activity.py)
- **Test Error:** TEST BLOCKED

The staff login could not be completed — valid admin credentials were not accepted.

Observations:
- A toast message 'Error de Acceso / Invalid login credentials' is visible on the page
- The login submit button was previously disabled and submission attempts did not sign in
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/7194ff52-c7b8-4851-86fe-bf421814f349
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Staff removes a client after confirming the action
- **Test Code:** [TC024_Staff_removes_a_client_after_confirming_the_action.py](./TC024_Staff_removes_a_client_after_confirming_the_action.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the staff user could not sign in because the UI rejected the provided credentials.

Observations:
- A toast message "Invalid login credentials" was shown.
- The login form remained visible and access to the dashboard or clients module was not available.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/0b673e47-59b0-42ea-968d-b1493dcdb9fd
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Review cash register balance after transactions
- **Test Code:** [TC025_Review_cash_register_balance_after_transactions.py](./TC025_Review_cash_register_balance_after_transactions.py)
- **Test Error:** TEST BLOCKED

The test could not be run — admin sign-in failed with invalid credentials, so the test steps that require an authenticated staff session could not be performed.

Observations:
- A toast is visible with the message 'Error de Acceso\nInvalid login credentials'.
- The admin login form (email and password fields and the 'Entrar al Gimnasio' button) is still displayed at /login?tab=admin.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/1954f023-5a2d-443b-9753-d825a228dae6
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Staff views a saved payment receipt
- **Test Code:** [TC026_Staff_views_a_saved_payment_receipt.py](./TC026_Staff_views_a_saved_payment_receipt.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the provided admin credentials appear to be invalid, preventing access to the dashboard and the Payments history required by the test.

Observations:
- A toast titled 'Error de Acceso' with text 'Invalid login credentials' is visible on the page.
- The page remains on the admin login screen with the email and password fields displayed (no dashboard access).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/fd8d7287-d68b-449b-8e17-87fb55404890
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Open a late payment record and inspect balance details
- **Test Code:** [TC027_Open_a_late_payment_record_and_inspect_balance_details.py](./TC027_Open_a_late_payment_record_and_inspect_balance_details.py)
- **Test Error:** TEST BLOCKED

Login could not be performed — the provided admin credentials were rejected and no alternative credentials were supplied.

Observations:
- A toast error is visible: 'Error de Acceso' with message 'Invalid login credentials'.
- The admin login form (email and password fields) remains on screen and no navigation to the dashboard occurred.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/040a15f4-adac-4a50-afde-891df96b98c2
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 View master SaaS overview
- **Test Code:** [TC028_View_master_SaaS_overview.py](./TC028_View_master_SaaS_overview.py)
- **Test Error:** TEST BLOCKED

The SaaS master dashboard could not be reached because login failed due to invalid credentials.

Observations:
- A toast message 'Error de Acceso: Invalid login credentials' is displayed.
- The SaaS Master login form remains visible with email and password inputs filled.
- Multiple submit attempts were made but no navigation to the master dashboard occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/d5de2d0a-fc12-4f9e-a516-c32247bf5a16
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Create a plan with permissions applied
- **Test Code:** [TC029_Create_a_plan_with_permissions_applied.py](./TC029_Create_a_plan_with_permissions_applied.py)
- **Test Error:** TEST BLOCKED

The admin login could not be completed — the provided credentials are not accepted, preventing access to the Plans feature required by the test.

Observations:
- A toast was shown: 'Error de Acceso' with message 'Invalid login credentials'
- The page remained on the admin login form with the email field filled and the submit action not completing

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/80e125bb-f530-453b-932f-866495aad8e3
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC030 Compare report categories across charts
- **Test Code:** [TC030_Compare_report_categories_across_charts.py](./TC030_Compare_report_categories_across_charts.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI rejected the provided credentials and prevented access to the admin area, so the reports module cannot be reached.

Observations:
- A toast message showed: 'Error de Acceso\nInvalid login credentials'
- The login form was reachable and the submit was clicked, but authentication failed (no access to reports)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b3bb73c5-306f-4f04-9f6b-440f64260222/34977bbb-da8e-4a92-91b9-1e1211605a11
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **3.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---