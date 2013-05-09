/**
 * Initial setup for the panels interface
 *
 * @copyright Greg Priday 2013
 * @license GPL 2.0 http://www.gnu.org/licenses/gpl-2.0.html
 */

jQuery( function ( $ ) {

    $( window ).bind( 'resize', function ( event ) {
        // ui-resizable elements trigger resize
        if ( $( event.target ).hasClass( 'ui-resizable' ) ) return;
        
        // Resize all the grid containers
        $( '#panels-container .grid-container' ).panelsResizeCells();
    } );

    // Create a sortable for the grids
    $( '#panels-container' ).sortable( {
        items:    '> .grid-container',
        handle:   '.grid-handle',
        tolerance:'pointer',
        stop:     function () {
            $( this ).find( '.cell' ).each( function () {
                // Store which grid this is in by finding the index of the closest .grid-container
                $( this ).find( 'input[name$="[grid]"]' ).val( $( '#panels-container .grid-container' ).index( $( this ).closest( '.grid-container' ) ) );
            } );

            $( '#panels-container .panels-container' ).trigger( 'refreshcells' );
        }
    } );

    // Create the add grid dialog
    var gridAddDialogButtons = {};
    gridAddDialogButtons[panels.i10n.buttons.add] = function () {
        var num = Number( $( '#grid-add-dialog' ).find( 'input' ).val() );

        if ( num == NaN ) {
            alert( 'Invalid Number' );
            return false;
        }

        num = Math.round( num );
        num = Math.max( 1, num );
        num = Math.min( 10, num );
        var gridContainer = window.panels.createGrid( num );
        gridContainer.hide().slideDown();
        $( '#grid-add-dialog' ).dialog( 'close' );
    };

    $( '#grid-add-dialog' )
        .show()
        .dialog( {
            dialogClass: 'panels-admin-dialog',
            autoOpen:false,
            modal:   true,
            title:   $( '#grid-add-dialog' ).attr( 'data-title' ),
            open:    function () {
                $( this ).find( 'input' ).val( 2 ).select();
            },
            buttons: gridAddDialogButtons
        })
        .on('keydown', function(e) {
            if (e.keyCode == $.ui.keyCode.ENTER) {
                // This is the same as clicking the add button
                $(this ).closest('.ui-dialog').find('.ui-dialog-buttonpane .ui-button:eq(0)').click();
            }
            else if (e.keyCode === $.ui.keyCode.ESCAPE) {
                $(this ).dialog('close');
            }
        });
    ;

    // Create the main add widgets dialog
    $( '#panels-dialog' ).show()
        .dialog( {
            dialogClass: 'panels-admin-dialog',
            autoOpen:    false,
            resizable:   false,
            draggable:   false,
            modal:       true,
            title:       $( '#panels-dialog' ).attr( 'data-title' ),
            minWidth:    960,
            maxHeight:   Math.round($(window).height() * 0.925),
            close:       function () {
                $( '#panels-container .panel.new-panel' ).hide().slideDown( 1000 ).removeClass( 'new-panel' );
            }
        } )
        .on('keydown', function(e) {
            if (e.keyCode === $.ui.keyCode.ESCAPE) {
                $(this ).dialog('close');
            }
        })
        .find( '.panel-type' ).disableSelection();
    
    $( '#so-panels-panels .handlediv' ).click( function () {
        // Trigger the resize to reorganise the columns
        setTimeout( function () {
            $( window ).resize();
        }, 150 );
    } )

    // The button for adding a panel
    $( '#panels .panels-add')
        .button( {
            icons: {primary: 'ui-icon-add'},
            text:  false
        } )
        .click( function () {
            $('#panels-text-filter-input' ).val('').keyup();
            $( '#panels-dialog' ).dialog( 'open' );
            return false;
        } );

    // The button for adding a grid
    $( '#panels .grid-add' )
        .button( {
            icons: {primary: 'ui-icon-columns'},
            text:  false
        } )
        .click( function () {
            $( '#grid-add-dialog' ).dialog( 'open' );
            return false;
        } );

    // Set the default text of the SiteOrigin link
    $('#siteorigin-widgets-link').data('text', $('#siteorigin-widgets-link').html() );

    // Handle filtering in the panels dialog
    $( '#panels-text-filter-input' )
        .keyup( function (e) {
            if( e.keyCode == 13 ) {
                // If we pressed enter and there's only one widget, click it
                var p = $( '#panels-dialog .panel-type-list .panel-type:visible' );
                if( p.length == 1 ) p.click();
                return;
            }

            var value = $( this ).val();

            if(value != '') {
                // Change the text
                $('#siteorigin-widgets-link')
                    .html(
                        $('#siteorigin-widgets-link').data('text').replace('More', '"'+value+'"')
                    )
                    .attr('href', $('#siteorigin-widgets-link').data('search').replace('{search}', encodeURIComponent(value)));
            }
            else {
                // Change the text
                $('#siteorigin-widgets-link')
                    .html($('#siteorigin-widgets-link').data('text'))
                    .attr('href',$('#siteorigin-widgets-link').data('original'));
            }

            // Filter the panels
            $( '#panels-dialog .panel-type-list .panel-type' )
                .show()
                .each( function () {
                    if ( value == '' ) return;

                    if ( $( this ).find( 'h3' ).html().toLowerCase().indexOf( value ) == -1 ) {
                        $( this ).hide();
                    }
                } )
        } )
        .click( function () {
            $( this ).keyup()
        } );

    // Handle adding a new panel
    $( '#panels-dialog .panel-type' ).click( function () {
        var panel = $('#panels-dialog').panelsCreatePanel( $( this ).attr('data-class') );

        panels.addPanel(panel, null, null, true);

        // Close the add panel dialog
        $( '#panels-dialog' ).dialog( 'close' );
    } );

    

    // Either setup an initial grid or load one from the panels data
    if ( typeof panelsData != 'undefined' ) panels.loadPanels(panelsData);
    else panels.createGrid( 1 );

    $( window ).resize( function () {
        // When the window is resized, we want to center any panels-admin-dialog dialogs
        $( '.panels-admin-dialog' ).filter( ':data(dialog)' ).dialog( 'option', 'position', 'center' );
    } );

    // This is the part where we move the panels box into a tab of the content editor
    $( '#wp-content-editor-tools' )
        .find( '.wp-switch-editor' )
        .click(function () {
            var $$ = $(this);

            $( '#wp-content-editor-container, #post-status-info' ).show();
            $( '#so-panels-panels' ).hide();
            $( '#wp-content-wrap' ).removeClass('panels-active');

            $('#content-resize-handle' ).show();
        } ).end()
        .prepend(
            $( '<a id="content-panels" class="hide-if-no-js wp-switch-editor switch-panels">' + $( '#so-panels-panels h3.hndle span' ).html() + '</a>' )
                .click( function () {
                    var $$ = $( this );
                    // This is so the inactive tabs don't show as active
                    $( '#wp-content-wrap' ).removeClass( 'tmce-active html-active' );

                    // Hide all the standard content editor stuff
                    $( '#wp-content-editor-container, #post-status-info' ).hide();

                    $( '#so-panels-panels' ).show();
                    $( '#wp-content-wrap' ).addClass( 'panels-active' );

                    // Triggers full refresh
                    $( window ).resize();
                    $('#content-resize-handle' ).hide();

                    return false;
                } )
        );

    $( '#wp-content-editor-tools .wp-switch-editor' ).click(function(){
        // This fixes an occasional tab switching glitch
        var $$ = $(this);
        var p = $$.attr('id' ).split('-');
        $( '#wp-content-wrap' ).addClass(p[1] + '-active');
    });

    // This is for the home page panel
    $('#panels-home-page #post-body' ).show();
    $('#panels-home-page #post-body-wrapper' ).css('background', 'none');

    // Reposition the panels box
    $( '#so-panels-panels' )
        .insertAfter( '#wp-content-editor-container' )
        .addClass( 'wp-editor-container' )
        .hide()
        .find( '.handlediv' ).remove()
        .end()
        .find( '.hndle' ).html('' ).append(
            $('#add-to-panels')
        );

    // When the content panels button is clicked, trigger a window resize to set up the columns
    $('#content-panels' ).click(function(){
        $(window ).resize();
    });

    if ( typeof panelsData != 'undefined' || $('#panels-home-page' ).length) $( '#content-panels' ).click();
    // Click again after the panels have been set up
    setTimeout(function(){
        if ( typeof panelsData != 'undefined' || $('#panels-home-page' ).length) $( '#content-panels' ).click();
        $('#so-panels-panels .hndle' ).unbind('click');
        $('#so-panels-panels .cell' ).eq(0 ).click();
    }, 150);

    if($('#panels-home-page' ).length){
        // Lets do some home page settings
        $('#content-tmce, #content-html' ).remove();
        $('#content-panels' ).hide();

        // Initialize the toggle switch
        $('#panels-toggle-switch' )
            .mouseenter(function(){
                $(this ).addClass('subtle-move');
            })
            .click(function(){
                $(this ).toggleClass('state-off').toggleClass('state-on' ).removeClass('subtle-move');
                $('#panels-home-enabled' ).val( $(this ).hasClass('state-off') ? 'false' : 'true' );
            } )
            .add('#panels-toggle-switch *').disableSelection();

        // Handle the previews
        $('#post-preview' ).click(function(event){
            // If we're currently displaying Panels
            if($('#wp-content-wrap' ).hasClass('panels-active')){
                var form = $('#panels-container' ).closest('form');
                var originalAction = form.attr('action');
                form.attr('action', panels.previewUrl ).attr('target', '_blank').submit().attr('action', originalAction).attr('target', '_self');
                event.preventDefault();
            }
        });
    }
} );