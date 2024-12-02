// ...existing code...
const session = {
  // ...existing properties...
  save: async () => {
    // Implementation of save method
  },
  destroy: (callback: (err: Error | null) => void) => {
    // Implementation of destroy method
    callback(null);
  },
};

someFunction({
  // ...existing properties...
  save: session.save,
  destroy: session.destroy,
});
// ...existing code...
