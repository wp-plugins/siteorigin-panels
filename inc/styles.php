<?php


/**
 * Admin action for handling fetching the style fields
 */
function siteorigin_panels_ajax_action_style_form(){
	$type = $_REQUEST['type'];
	if( !in_array($type, array('row', 'widget') ) ) exit();

	$current = isset($_REQUEST['style']) ? $_REQUEST['style'] : array();

	switch($type) {
		case 'row':
			siteorigin_panels_render_styles_fields('row', '<h3>' . __('Row Styles', 'siteorigin-panels') . '</h3>', '', $current);
			break;

		case 'widget':
			siteorigin_panels_render_styles_fields('widget', '<h3>' . __('Widget Styles', 'siteorigin-panels') . '</h3>', '', $current);
	}

	exit();
}
add_action('wp_ajax_so_panels_style_form', 'siteorigin_panels_ajax_action_style_form');

/**
 * Render all the style fields
 *
 * @param $section
 * @param string $before
 * @param string $after
 * @param array $current
 */
function siteorigin_panels_render_styles_fields( $section, $before = '', $after = '', $current = array() ){
	$fields = apply_filters('siteorigin_panels_' . $section . '_style_fields', array() );
	if( empty($fields) ) return false;

	$groups = array(
		'attributes' => array(
			'name' => __('Attributes', 'siteorigin-panels'),
			'priority' => 5
		),
		'layout' => array(
			'name' => __('Layout', 'siteorigin-panels'),
			'priority' => 10
		),
		'design' => array(
			'name' => __('Design', 'siteorigin-panels'),
			'priority' => 15
		),
	);

	// Check if we need a default group
	foreach($fields as $field_id => $field) {
		if( empty($field['group']) ) {
			if( empty($groups['theme']) ) {
				$groups['theme'] = array(
					'name' => __('Theme', 'siteorigin-panels'),
					'priority' => 10
				);
			}
			$fields[$field_id]['group'] = 'theme';
		}
	}
	$groups = apply_filters('siteorigin_panels_' . $section . '_style_groups', $groups );

	// Sort the style fields and groups by priority
	uasort( $fields, 'siteorigin_panels_styles_sort_fields' );
	uasort( $groups, 'siteorigin_panels_styles_sort_fields' );

	echo $before;

	$group_counts = array();
	foreach( $fields as $field_id => $field ) {
		if(empty($group_counts[$field['group']])) $group_counts[$field['group']] = 0;
		$group_counts[$field['group']]++;
	}

	foreach( $groups as $group_id => $group ) {

		if( empty( $group_counts[$group_id] ) ) continue;

		?>
		<div class="style-section-wrapper">
			<div class="style-section-head">
				<h4><?php echo esc_html($group['name']) ?></h4>
			</div>
			<div class="style-section-fields" style="display: none">
				<?php
					foreach( $fields as $field_id => $field ) {

						if($field['group'] == $group_id){
							?>
							<div class="style-field-wrapper">
								<label><?php echo $field['name'] ?></label>
								<div class="style-field style-field-<?php echo sanitize_html_class( $field['type'] ) ?>">
									<?php siteorigin_panels_render_style_field( $field, isset( $current[$field_id] ) ? $current[$field_id] : false, $field_id ) ?>
								</div>
							</div>
							<?php

						}

					}
				?>
			</div>
		</div>
		<?php
	}

	echo $after;
}

/**
 * Generate the style field
 *
 * @param $field
 * @param $current
 */
function siteorigin_panels_render_style_field( $field, $current, $field_id ){
	$field_name = 'style['.$field_id.']';

	echo '<div class="style-input-wrapper">';
	switch($field['type']) {
		case 'measurement' :
			?>
			<input type="text" />
			<select>
				<option>px</option>
				<option>%</option>
				<option>in</option>
				<option>cm</option>
				<option>mm</option>
				<option>em</option>
				<option>ex</option>
				<option>pt</option>
				<option>pc</option>
			</select>
			<input type="hidden" name="<?php echo esc_attr($field_name) ?>" value="<?php echo esc_attr( $current ) ?>" />
			<?php
			break;

		case 'color' :
			?>
			<input type="text" name="<?php echo esc_attr($field_name) ?>" value="<?php echo esc_attr( $current ) ?>" class="so-wp-color-field" />
			<?php
			break;

		case 'image' :
			$image = false;
			if( !empty($current) ) {
				$image = wp_get_attachment_image_src($current, 'thumbnail');
			}

			?>
			<div class="so-image-selector">
				<div class="current-image" <?php if( !empty($image) ) echo 'style="background-image: url(' . esc_url($image[0]) . ');"'; ?>>
				</div>

				<div class="select-image">
					<?php _e('Select Image') ?>
				</div>
				<input type="hidden" name="<?php echo esc_attr($field_name) ?>" value="<?php echo intval($current) ?>" />
			</div>
			<a href="#" class="remove-image"><?php _e('Remove') ?></a>
			<?php
			break;

		case 'url' :
		case 'text' :
			?><input type="text" name="<?php echo esc_attr($field_name) ?>" value="<?php echo esc_attr($current) ?>" class="widefat" /><?php
			break;

		case 'checkbox' :
			?>
			<label class="so-checkbox-label">
				<input type="checkbox" name="<?php echo esc_attr($field_name) ?>" <?php checked($current) ?> />
				<?php _e('Enabled', 'siteorigin-panels') ?>
			</label>
			<?php
			break;

		case 'select' :
			?>
			<select name="<?php echo esc_attr($field_name) ?>">
				<?php foreach($field['options'] as $k => $v) : ?>
					<option value="<?php echo esc_attr($k) ?>" <?php selected($current, $k) ?>><?php echo esc_html($v) ?></option>
				<?php endforeach; ?>
			</select>
			<?php
			break;

		case 'textarea' :
		case 'code' :
			?><textarea type="text" name="<?php echo esc_attr($field_name) ?>" class="widefat <?php if($field['type'] == 'code') echo 'so-field-code'; ?>" rows="4"><?php echo esc_textarea($current) ?></textarea><?php
			break;
	}

	echo '</div>';

	if( !empty($field['description']) ) {
		?><p class="so-description"><?php echo wp_kses_post( $field['description'] ) ?></p><?php
	}
}

/**
 * User sort function to sort by the priority key value.
 *
 * @param $a
 * @param $b
 *
 * @return int
 */
function siteorigin_panels_styles_sort_fields($a, $b){
	return ( ( isset( $a['priority'] ) ? $a['priority'] : 10 ) > ( isset( $b['priority'] ) ? $b['priority'] : 10 ) ) ? 1 : -1;
}

/**
 * Sanitize the style fields in panels_data
 *
 * @param $panels_data
 *
 * @return mixed
 */
function siteorigin_panels_styles_sanitize_all($panels_data){

	if( !empty($panels_data['widgets']) ) {
		// Sanitize the widgets
		for ( $i = 0; $i < count( $panels_data['widgets'] ); $i ++ ) {
			if ( empty( $panels_data['widgets'][ $i ]['panels_info']['style'] ) ) {
				continue;
			}
			$panels_data['widgets'][ $i ]['panels_info']['style'] = siteorigin_panels_sanitize_style_fields( 'widget', $panels_data['widgets'][ $i ]['panels_info']['style'] );
		}
	}

	if( !empty($panels_data['grids']) ) {
		// The rows
		for ( $i = 0; $i < count( $panels_data['grids'] ); $i ++ ) {
			if ( empty( $panels_data['grids'][ $i ]['style'] ) ) {
				continue;
			}
			$panels_data['grids'][ $i ]['style'] = siteorigin_panels_sanitize_style_fields( 'row', $panels_data['grids'][ $i ]['style'] );
		}
	}

	if( !empty($panels_data['grid_cells']) ) {
		// And finally, the cells
		for ( $i = 0; $i < count( $panels_data['grid_cells'] ); $i ++ ) {
			if ( empty( $panels_data['grid_cells'][ $i ]['style'] ) ) {
				continue;
			}
			$panels_data['grid_cells'][ $i ]['style'] = siteorigin_panels_sanitize_style_fields( 'cell', $panels_data['grid_cells'][ $i ]['style'] );
		}
	}

	return $panels_data;
}

/**
 * Sanitize style fields.
 *
 * @param $section
 * @param $styles
 *
 * @return Sanitized styles
 */
function siteorigin_panels_sanitize_style_fields($section, $styles){
	static $fields_cache = array();

	// Use the filter to get the fields for this section.
	if( empty($fields_cache[$section]) ) {
		$fields_cache[$section] = apply_filters('siteorigin_panels_' . $section . '_style_fields', array() );
	}
	$fields = $fields_cache[$section];


	$return = array();
	foreach($fields as $k => $field) {

		// Ignore this if we don't even have a value for the style
		if(empty($styles[$k])) continue;

		switch($field['type']) {
			case 'color' :
				$color = $styles[$k];
				if ( preg_match('|^#([A-Fa-f0-9]{3}){1,2}$|', $color ) ) $return[$k] = $color;
				else $return[$k] = '';
				break;
			case 'image' :
				$return[$k] = !empty( $styles[$k] ) ? intval( $styles[$k] ) : false;
				break;
			case 'url' :
				$return[$k] = esc_url_raw( $styles[$k] );
				break;
			case 'checkbox' :
				$return[$k] = !empty( $styles[$k] );
				break;
			case 'measurement' :
				preg_match('/([0-9\.,]+)(.*)/', $styles[$k], $match);
				if( !empty($match[1]) && !empty($match[2]) ) $return[$k] = $styles[$k];
				else $return[$k] = '';
				break;
			case 'select' :
				if( !empty( $styles[$k] ) && in_array( $styles[$k], array_keys( $field['options'] ) ) ) {
					$return[$k] = $styles[$k];
				}
				break;
			default:
				// Just pass the value through.
				$return[$k] = $styles[$k];
				break;

		}
	}

	return $return;
}