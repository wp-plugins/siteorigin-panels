<?php

function siteorigin_panels_options_admin_menu() {
	add_options_page( __('SiteOrigin Page Builder', 'so-panels'), __('Page Builder', 'so-panels'), 'manage_options', 'siteorigin_panels', 'siteorigin_panels_options_page' );
}
add_action( 'admin_menu', 'siteorigin_panels_options_admin_menu' );

function siteorigin_panels_options_page(){
	include plugin_dir_path(SITEORIGIN_PANELS_BASE_FILE) . '/tpl/options.php';
}

function siteorigin_panels_options_init() {
	register_setting( 'siteorigin-panels', 'siteorigin_panels_post_types', 'siteorigin_panels_options_sanitize_post_types' );
	register_setting( 'siteorigin-panels', 'siteorigin_panels_display', 'siteorigin_panels_options_sanitize_display' );

	add_settings_section( 'general', __('General', 'so-panels'), 'siteorigin_panels_options_section', 'siteorigin-panels' );
	add_settings_section( 'display', __('Display', 'so-panels'), 'siteorigin_panels_options_section', 'siteorigin-panels' );

	add_settings_field( 'post-types', __('Post Types', 'so-panels'), 'siteorigin_panels_options_field_post_types', 'siteorigin-panels', 'general' );

	// The display fields
	add_settings_field( 'post-types', __('Responsive', 'so-panels'), 'siteorigin_panels_options_field_display', 'siteorigin-panels', 'display', array( 'type' => 'responsive' ));
	add_settings_field( 'mobile-width', __('Mobile Width', 'so-panels'), 'siteorigin_panels_options_field_display', 'siteorigin-panels', 'display', array( 'type' => 'mobile-width' ));
	add_settings_field( 'margin-sides', __('Margin Sides', 'so-panels'), 'siteorigin_panels_options_field_display', 'siteorigin-panels', 'display', array( 'type' => 'margin-sides' ));
	add_settings_field( 'margin-bottom', __('Margin Bottom', 'so-panels'), 'siteorigin_panels_options_field_display', 'siteorigin-panels', 'display', array( 'type' => 'margin-bottom' ));
}
add_action( 'admin_init', 'siteorigin_panels_options_init' );

function siteorigin_panels_options_section($args){

}

function siteorigin_panels_options_field_post_types($args){
	$panels_post_types = siteorigin_panels_setting('post-types');

	$all_post_types = get_post_types(array('_builtin' => false));
	$all_post_types = array_merge(array('page' => 'page', 'post' => 'post'), $all_post_types);
	
	foreach($all_post_types as $type){
		$info = get_post_type_object($type);
		if(empty($info->labels->name)) continue;
		$checked = in_array(
			$type,
			$panels_post_types
		);
		
		?>
		<label>
			<input type="checkbox" name="siteorigin_panels_post_types[<?php echo esc_attr($type) ?>]" value="<?php echo esc_attr($type) ?>" <?php checked($checked) ?> />
			<?php echo esc_html($info->labels->name) ?>
		</label><br/>
		<?php
	}
	
	?><p class="description"><?php _e('Post types that will have the page builder available', 'so-panels') ?></p><?php
}

function siteorigin_panels_options_field_display($args){
	$settings = siteorigin_panels_setting();
	switch($args['type']) {
		case 'responsive' :
			?><label><input type="checkbox" name="siteorigin_panels_display[<?php echo esc_attr($args['type']) ?>]" <?php checked($settings[$args['type']]) ?> /> <?php _e('Enabled', 'so-panels') ?></label><?php
			break;
		case 'margin-bottom' :
		case 'margin-sides' :
		case 'mobile-width' :
			?><input type="text" name="siteorigin_panels_display[<?php echo esc_attr($args['type']) ?>]" value="<?php echo esc_attr($settings[$args['type']]) ?>" class="small-text" /> <?php _e('px', 'so-panels') ?><?php
			break;
	}
}

function siteorigin_panels_options_sanitize_post_types($types){
	$all_post_types = get_post_types(array('_builtin' => false));
	$all_post_types = array_merge(array('post' => 'post', 'page' => 'page'), $all_post_types);
	foreach($types as $type => $val){
		if(!in_array($type, $all_post_types)) unset($types[$type]);
		else $types[$type] = !empty($types[$type]);
	}
	
	// Only non empty items
	return array_keys(array_filter($types));
}

function siteorigin_panels_options_sanitize_display($vals){
	foreach($vals as $f => $v){
		switch($f){
			case 'responsive' :
				$vals[$f] = !empty($vals[$f]);
				break;
			case 'margin-bottom' :
			case 'margin-sides' :
			case 'mobile-width' :
				$vals[$f] = intval($vals[$f]);
				break;
		}
	}
	$vals['responsive'] = !empty($vals['responsive']);
	return $vals;
}