export const withDefaults =
  (template, expectedArgsDefaults, debug = false) =>
  (receivedArgs) => {
    const argsWithDefault = Object.fromEntries(
      expectedArgsDefaults.map(([argName, argDefault]) => [argName, receivedArgs[argName] ?? [argDefault]])
    );

    if (debug) {
      console.log(argsWithDefault, expectedArgsDefaults, receivedArgs);
    }

    const expectedArgsNames = Object.keys(expectedArgsDefaults)
    Object.keys(receivedArgs).forEach((receivedArgName) => {
      if (!expectedArgsNames.includes(receivedArgName)) {
        throw new Error(
          `Templated received unexpected argument named "${receivedArgName}". Expecting only ${expectedArgsNames.join(
            ", "
          )}`
        );
      }
    });

    return template(argsWithDefault);
  };
