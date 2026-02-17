const UserSchema = require('./User');
const VisitorSchema = require('./Visitor');
const AuditLogSchema = require('./AuditLog');

const modelsCache = new Map();

const getModels = (connection) => {
    if (!connection) {
        throw new Error('Connection is required to generate models');
    }

    // Check cache to avoid recompiling models (Mongoose throws error if model exists)
    // Use connection.id or similar as key? connection.id is unique.
    const connId = connection.id;

    // Actually, createConnection returns a connection instance.
    // Models are scoped to connection.
    // We can check if 'User' is already in connection.models

    // Ideally we return the models attached to this connection.

    const User = connection.models.User || connection.model('User', UserSchema);
    const Visitor = connection.models.Visitor || connection.model('Visitor', VisitorSchema);
    const AuditLog = connection.models.AuditLog || connection.model('AuditLog', AuditLogSchema);

    // Ensure indexes
    // (Optional: explicit sync, but mongoose does it usually)

    return {
        User,
        Visitor,
        AuditLog
    };
};

module.exports = { getModels };
