module.exports = {
  from: () => ({
    insert: async () => ({ data: [{}], error: null }),
    update: async () => ({ data: [{}], error: null }),
    select: async () => ({ data: [{}], error: null }),
    delete: function () {
      return {
        eq: async () => ({ error: null })
      };
    },
    eq: async () => ({ data: [{}], error: null }),
    single: async () => ({ data: {}, error: null }),
  }),
};
