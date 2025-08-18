module.exports = {
  create: async () => ({
    on: () => {},
    onMessage: () => {},
    sendText: async (number, message) => ({ id: 'mock-id', number, message }),
    logout: async () => {},
  }),
};
