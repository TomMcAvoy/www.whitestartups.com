export function extendContext(context, request, response) {
  return {
    ...context,
    request: request || context.request,
    response: response || context.response,
  };
}
