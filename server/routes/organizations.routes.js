const express = require('express');
const router = express.Router();

const {
    createOrganization,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    requestChangesOrganization,
} = require('../controllers/organizations.controller');

router.post('/', createOrganization);

router.get('/pending', getPendingOrganizations);

router.post('/:id/approve', approveOrganization);

router.post('/:id/reject', rejectOrganization);

router.post('/:id/request-changes', requestChangesOrganization);

module.exports = router;