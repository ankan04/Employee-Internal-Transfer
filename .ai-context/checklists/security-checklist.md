<!-- Blank. Per INT_SDD_Standard.md §30 "Security Checklist (used at Gate 2 and
     on every hotfix)". Reach your own conclusions — the security assessment
     in reviews/employee-internal-transfer.security.md is the implementer's
     own evidence, not a substitute for independent review. -->

# Security Checklist

**Reviewer:** _____________________
**Date:** _____________________

- [ ] No PII in logs at any level
- [ ] No secrets, credentials, or tokens hardcoded or logged
- [ ] All new/changed endpoints have an explicit rate-limit decision
- [ ] New dependencies vetted (maintained, real, approved) before entering the manifest
- [ ] Auth boundaries and least-privilege IAM checked, not assumed
- [ ] Data-at-rest and in-transit handling matches `constitution.md`
- [ ] SAST/DAST and dependency scan run and clean (or exceptions explicitly signed off)

**Findings:**

_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
