<?php

class SiteOrigin_Panels_Widget_Price_Box extends SiteOrigin_Panels_Widget  {
	function __construct() {
		parent::__construct(
			__('Price Box', 'so-panels'),
			array(
				'description' => __('Displays a bullet list of elements', 'so-panels'),
				'default_style' => 'simple',
			),
			array(),
			array(
				'title' => array(
					'type' => 'text',
					'label' => __('Title', 'so-panels'),
				),
				'price' => array(
					'type' => 'text',
					'label' => __('Price', 'so-panels'),
				),
				'per' => array(
					'type' => 'text',
					'label' => __('Per', 'so-panels'),
				),
				'information' => array(
					'type' => 'text',
					'label' => __('Features Text', 'so-panels'),
				),
				'features' => array(
					'type' => 'textarea',
					'label' => __('Information Text', 'so-panels'),
				),
				'button_text' => array(
					'type' => 'text',
					'label' => __('Button Text', 'so-panels'),
				),
				'button_url' => array(
					'type' => 'text',
					'label' => __('Button URL', 'so-panels'),
				),
			)
		);

		$this->add_sub_widget('button', __('Button', 'so-panels'), 'SiteOrigin_Panels_Widget_Button');
		$this->add_sub_widget('list', __('Feature List', 'so-panels'), 'SiteOrigin_Panels_Widget_List');
	}
}