export const baseColors = {
	contrast: {
		light: "gray-700" as const,
		dark: "white" as const
	}
};
export type ContrastColor = typeof baseColors.contrast[keyof typeof baseColors.contrast];

export const colorSpec = {
	cyan: { light: "cyan-400", dark: "cyan-400", hoverSwitch: false },
	red: { light: "red-500", dark: "red-500", hoverSwitch: false },
	white: { light: "gray-700", dark: "white", hoverSwitch: true }
};

/**
 * ## Allowed color
 *
 * A color key contained in the color specification.
 */
export type AllowedColor = keyof typeof colorSpec;

const { light: contrastLight, dark: contrastDark } = baseColors.contrast;
function getNeonButtonUtils(colorKey: AllowedColor): string {
	const { light: lightColor, dark: darkColor, hoverSwitch } = colorSpec[colorKey];
	return ["bg", "border", "shadow", "text", "hover:text"]
		.map((util) => {
			let light = lightColor;
			let dark = darkColor;
			if (util === "text") {
				light = contrastLight;
				dark = contrastDark;
			}
			if (util === "hover:text") {
				light = hoverSwitch ? contrastDark : contrastLight;
				dark = hoverSwitch ? contrastLight : contrastDark;
			}
			return `light:${util}-${light} dark:${util}-${dark}`;
		})
		.join(" ");
}
const colorKeyUtilsPairs = Object.keys(colorSpec).map((colorKey: AllowedColor) => [
	colorKey,
	getNeonButtonUtils(colorKey)
]);
/**
 * ## Color utils
 *
 * Color-specific windi utilities for neon buttons based on button color.
 * These utilities are included in the `safelist`.
 * Must be placed in the `class` attribute value, NOT in any other windi attributify attribute.
 */
export const colorUtils = Object.fromEntries(colorKeyUtilsPairs) as Record<AllowedColor, string>;

/**
 * ## Safelist
 *
 * Color-specific windi utilities required by components but built dynamically.
 */
export const safelist = colorKeyUtilsPairs.map((pair) => pair[1]);
