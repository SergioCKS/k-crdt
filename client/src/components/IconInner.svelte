<!-- 
  @component
  # Icon (inner)

  Inner Iconify icon component wrapped optionally wrapped in an anchor tag.

  This component is NOT meant to be used directly. Use the `Icon` component instead.
-->

<!-- Outer span layer prevents Svelte error when removing node -->
<span on:click class={$$props.class || ""}>
	<span
		class="iconify"
		style={$$props.fontSize ? `font-size: ${$$props.fontSize};` : undefined}
		data-width={$$props.width}
		data-height={$$props.height}
		data-icon={$$props.name}
		data-inline={$$props.inline}
		data-align={$$props.align}
		data-flip={$$props.flip}
		data-rotate={$$props.rotateAntiClockwise}
	/>
</span>
