import { FileHelper } from "@supernovaio/export-helpers";
import {
  OutputTextFile,
  Token,
  TokenGroup,
  TokenType,
} from "@supernovaio/sdk-exporters";
import { exportConfiguration } from "..";
import { convertedStyleToken } from "../content/token";

export function styleOutputFile(
  type: TokenType,
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  theme: string
): OutputTextFile | null {
  // Filter tokens by top level type
  const tokensOfType = tokens.filter((token) => token.tokenType === type);

  // Filter out files where there are no tokens, if enabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null;
  }

  // Convert all tokens to CSS variables
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]));
  const cssVariables = tokensOfType
    .map((token) => convertedStyleToken(token, mappedTokens, tokenGroups))
    .join("\n");

  // Create file content
  let content = `[data-theme="${theme.toLowerCase()}"] {\n${cssVariables}\n}`;
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    // Add disclaimer to every file if enabled
    content = `/* ${exportConfiguration.disclaimer} */\n${content}`;
  }

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath,
    fileName: exportConfiguration.styleFileNames[type],
    content: content,
  });
}
