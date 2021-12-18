<!-- 
  @component
  # Icon 
  Wrapper for Iconify icon.

  * You can specify `flip` and `rotate` simultaneously. `flip` is applied first, followed by `rotate`.
	* The icon will be dinamically loaded from the Iconify API, unless it was previously cached.
	* Besides the explicitly specified properties, the `class` prop will be passed down to the wrapper element of the icon. Using the class property, it is possible to change the icon color and font-size. The component-specific properties will override those specified via `class`.
-->
<script lang="ts">
	//#region Props
	/**
	 * ## Name
	 *
	 * The name of the icon. Must be a valid Iconify icon code. ([available icons](https://iconify.design/icon-sets/))
	 * Corresponds to the Iconify property `data-icon`.
	 */
	export let name: string;

	/**
	 * ## Inline
	 *
	 * Wether the icon will be inlined or not. ([Inline vs block](https://docs.iconify.design/implementations/iconify1/inline-vs-block.html))
	 * Corresponds to the Iconify property `data-inline`.
	 *
	 * * Default: `true`
	 */
	export let inline: boolean = true;

	/**
	 * ## Align Horizontal
	 *
	 * Horizontal alignment of the icon in case the bounding box is too wide.
	 * Is used to construct the Iconify property `data-align`.
	 *
	 * * Default: `center`
	 */
	export let alignHorizontal: "left" | "center" | "right" = "center";

	/**
	 * ## Align Vertical
	 *
	 * Vertical alignment of the icon in case the bounding box is too tall.
	 * Is used to construct the Iconify property `data-align`.
	 *
	 * * Default: `middle`
	 */
	export let alignVertical: "top" | "middle" | "bottom" = "middle";

	/**
	 * ## Slice
	 *
	 * If true, the parts of the icon that do not fit the bounding box will be cut.
	 * The default behaviour is that the icon will be scaled to fit the bounding box, and space will be added.
	 * Is used to construct the Iconify property `data-align`.
	 *
	 * * Default: `false`
	 */
	export let slice: boolean = false;

	/**
	 * ## Flip Horizontal
	 *
	 * If true, flips the icon horizontally (along the vertical "Y" axis).
	 * Is used to construct the Iconify property `data-flip`.
	 *
	 * * Default: `false`
	 */
	export let flipHorizontal: boolean = false;

	/**
	 * ## Flip Vertical
	 *
	 * If true, flips the icon vertically (along the horizontal "X" axis).
	 * Is used to construct the Iconify property `data-flip`.
	 *
	 * * Default `false`
	 */
	export let flipVertical: boolean = false;

	/**
	 * ## Rotate
	 *
	 * If specified, rotates the icon anti-clockwise by the specified angle.
	 * Corresponds to the Iconify property `data-rotate`.
	 *
	 * * Default: `undefined`
	 */
	export let rotate: "90deg" | "180deg" | "270deg" | undefined = undefined;

	/**
	 * ## Width
	 *
	 * Width of the Icon.
	 * Corresponds to the Iconify property `data-width`.
	 *
	 * * Default: `undefined`
	 */
	export let width: string | undefined = undefined;

	/**
	 * ## Height
	 *
	 * Height of the Icon.
	 * Corresponds to the Iconify property `data-height`.
	 *
	 * * Default: `undefined`
	 */
	export let height: string | undefined = undefined;

	/**
	 * ## Font Size
	 *
	 * If specified, sets the `font-size` CSS property of the icon. The default font size is `1em`.
	 * This is the recommended method to change the icon size.
	 *
	 * * Default: `undefined`
	 */
	export let fontSize: string | undefined = undefined;
	//#endregion

	//#region Computed Iconify props
	/**
	 * Final value passed to the `data-align` Iconify property. Combines the component properties `alignHorizontal`, `alignVertical`, and `slice`.
	 */
	$: align = [alignHorizontal, alignVertical, ...(slice ? ["slice"] : [])].join(", ");

	/**
	 * Final value passed to the `data-flip` Iconify property. Combines the component properties `flipHorizontal` and `flipVertical`.
	 */
	$: flip = [...(flipHorizontal ? ["horizontal"] : []), ...(flipVertical ? ["vertical"] : [])].join(
		", "
	);

	const rotationTransform = {
		"90deg": "270deg",
		"180deg": "180deg",
		"270deg": "90deg"
	};

	/**
	 * Final value passed to the `data-rotate` Iconify property.
	 */
	let rotateAntiClockwise = rotate ? rotationTransform[rotate] : undefined;
	//#endregion
</script>

<span on:click class={$$props.class || ""}>
	<span
		class="iconify"
		style={fontSize ? `font-size: ${fontSize};` : undefined}
		data-width={width}
		data-height={height}
		data-icon={name}
		data-inline={inline}
		data-align={align}
		data-flip={flip}
		data-rotate={rotateAntiClockwise}
	/>
</span>
