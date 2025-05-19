const optionTemplates = {
    initialOptions: {
        text: "Please select the option for your required query",
        options: [
            "membership",
            "Appointment", 
            "payment", 
            "registration", 
            "services_request", 
            "other"
        ]
    },
    ticketResponse: (ticketNumber) => ({
        text: `Your ticket has been created with number: ${ticketNumber}. Click here to provide more details.`,
        isTicket: true,
        ticketNumber: ticketNumber
    })
};

module.exports = optionTemplates;