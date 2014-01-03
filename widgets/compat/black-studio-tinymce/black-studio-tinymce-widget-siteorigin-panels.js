/**
 * @copyright Black Studio http://www.blackstudio.it
 * @license GPL 2.0
 */

jQuery(function($){
    // Set wpActiveEditor variables used when adding media from media library dialog
    $(document).on('click', '.editor_media_buttons a', function() {
        var $widget_inside = $(this).closest('div.ui-dialog')
        wpActiveEditor = $('textarea[id^=widget-black-studio-tinymce]', $widget_inside).attr('id');
    });

    setupTinyMCE = function(e) {
        var dialog = $(e.target);

        dialog.filter('.widget-dialog-wp_widget_black_studio_tinymce').find('a[id$=visual]').click();
        var $text_area = $(e.target).find('textarea[id^=widget-black-studio-tinymce]');

        // A slight hack, create a hidden field that will store the value in a way that WP wont interfere with.
        if(dialog.find('.tinymce-hidden-field-value').length == 0) {
            dialog.append(
                $('<input type="hidden" class="tinymce-hidden-field-value" />')
                    .attr('name', $text_area.attr('name'))
                    .val($text_area.val())
            );
        }
    }

    $(document).on('dialogopen', setupTinyMCE);
    $(document).on('panelsopen', setupTinyMCE);

    // Copy the value from the text editor to the hidden text field.
    $(document).on('dialogbeforeclose', function(e) {
        var $text_area = $(e.target).find('textarea[id^=widget-black-studio-tinymce]');
        if ($text_area.length > 0) {

            var editor = tinyMCE.get($text_area.attr('id'));
            if(typeof(editor) != 'undefined' && typeof( editor.getContent ) == "function") {
                var content = editor.getContent();
            }
            else {
                content = $text_area.val();
            }

            $(e.target).find('.tinymce-hidden-field-value').val(content);
        }
    } );

} );