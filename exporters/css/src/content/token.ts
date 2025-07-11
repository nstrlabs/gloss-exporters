import {
  NamingHelper,
  CSSHelper,
  StringCase,
} from "@supernovaio/export-helpers";
import { Token, TokenGroup } from "@supernovaio/sdk-exporters";
import { exportConfiguration } from "..";
import { capitalizeFirstLetter, parseTypographyString } from "./utils";

export function convertedStyleToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenStyleVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${tokenStyleVariableName(t, tokenGroups)})`;
    },
  });
  const indentString = " ".repeat(exportConfiguration.indent);

  if (exportConfiguration.showDescriptions && token.description) {
    // Generate token with comments
    return `${indentString}/* ${token.description.trim()} */\n${indentString}--${name}: ${value};`;
  } else {
    // Generate tokens without comments
    return `${indentString}--${name}: ${value};`;
  }
}

export function convertedTypeScriptToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenTypeScriptVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${tokenStyleVariableName(t, tokenGroups)})`;
    },
  });

  return `const ${name} = "${value.replace(/"/g, '\\"')}";`;
}

function tokenStyleVariableName(
  token: Token,
  tokenGroups: Array<TokenGroup>
): string {
  const prefix = exportConfiguration.tokenPrefixes[token.tokenType];
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!;
  return NamingHelper.codeSafeVariableNameForToken(
    token,
    exportConfiguration.tokenNameStyle,
    parent,
    prefix
  );
}

export function tokenTypeScriptVariableName(
  token: Token,
  tokenGroups: Array<TokenGroup>
): string {
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!;
  return NamingHelper.codeSafeVariableNameForToken(
    token,
    "camelCase" as StringCase,
    parent,
    null
  );
}

export function convertedTypographyToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = capitalizeFirstLetter(tokenTypeScriptVariableName(token, tokenGroups));

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${tokenStyleVariableName(t, tokenGroups)})`;
    },
  });

  const parsed = parseTypographyString(value);

  if (parsed) {
    const output = `const font${name} = ${JSON.stringify({
      fontSize: parsed.fontSize,
      fontFamily: parsed.fontFamily,
      fontWeight: parsed.fontWeight,
      lineHeight: parsed.lineHeight
    }, null, 2)};\n
const typography${name}FontSize = ${parsed.fontSize};\n
const typography${name}FontFamily = "${parsed.fontFamily}";\n
const typography${name}FontWeight = ${parsed.fontWeight};\n
const typography${name}LineHeight = ${parsed.lineHeight};`;

    return output;
  }
  return `Error -> font${name}`;
}

export function tokenTypographyVariableName(
  token: Token,
  tokenGroups: Array<TokenGroup>
): string {
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!;
  const name = capitalizeFirstLetter(NamingHelper.codeSafeVariableNameForToken(
    token,
    "camelCase" as StringCase,
    parent,
    null
  ));

  const output = `    font${name},\n
    typography${name}FontSize,\n
    typography${name}FontFamily,\n
    typography${name}FontWeight,\n
    typography${name}LineHeight`;


  return output;
}