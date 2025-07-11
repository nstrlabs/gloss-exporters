export function capitalizeFirstLetter(input: string): string {
  if (input.length === 0) return input; // Comprobación si el string está vacío
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function parseTypographyString(typographyString: string) {
  // Extraer las partes usando expresiones regulares
  const matches = typographyString.match(/"(\d+)"\s+(\d+)px\/(\d+)px\s+"([^"]+)"/);

  if (!matches || matches.length < 5) {
    return null;
  }

  return {
    fontWeight: parseInt(matches[1], 10),
    fontSize: parseInt(matches[2], 10),
    lineHeight: parseInt(matches[3], 10),
    fontFamily: matches[4]
  };
}