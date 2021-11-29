const { Schema, model } = require('mongoose');

const OportunitySchema = new Schema({
    customer: {
        type: String,
        required: [true, "Forneça um cliente!"]
    },
    date: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true
    }

},
    {
        timestamps: true,
    }
);

module.exports = model('Oportunity', OportunitySchema);