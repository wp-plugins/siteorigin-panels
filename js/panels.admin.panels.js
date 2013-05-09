/**
 * Main admin control for the Panel interface
 *
 * @copyright Greg Priday 2013
 * @license GPL 2.0 http://www.gnu.org/licenses/gpl-2.0.html
 */

(function($){

    var newPanelId = 0;

    panels.undoManager = new UndoManager();
    
    /**
     * A jQuery function to get panels data
     */
    $.fn.getPanelData = function(){
        var $$ = $(this);
        var data = {};

        $$.find( '.form *[name]' ).not( '[data-info-field]' ).each( function () {

            var name = /widgets\[[0-9]+\]\[([a-z0-9_]+)\]/.exec($(this).attr('name'));
            name = name[1];
            if ( $$.attr( 'type' ) == 'checkbox' ) data[name] = $( this ).is( ':checked' )
            else data[name] = $( this ).val();
        } );

        return data;
    }

    /**
     * Create and return a new panel
     *
     * @param type
     * @param data
     *
     * @return {*}
     */
    $.fn.panelsCreatePanel = function ( type, data ) {
        var dialogWrapper = $(this );
        var $$ = dialogWrapper.find('.panel-type[data-class="' + type + '"]' );

        if($$.length == 0) return null;

        // Hide the undo message
        $('#panels-undo-message' ).fadeOut(function(){ $(this ).remove() });

        var panel = $( '<div class="panel new-panel"><div class="panel-wrapper"><div class="title"><h4></h4><span class="actions"></span></div><small class="description"></small><div class="form"></div></div></div>' ).attr('data-type', type);
        var dialog;

        var formHtml = $$.attr( 'data-form' );
        formHtml = formHtml.replace( /\{\$id\}/g, newPanelId++ );

        panel
            .data( {
                // We need this data to update the title
                'title-field': $$.attr( 'data-title-field' ),
                'title':       $$.attr( 'data-title' )
            } )
            .find( 'h4, h5' ).click( function () {
                dialog.dialog( 'open' );
                return false;
            } )
            .end().find( '.description' ).html( $$.find( '.description' ).html() )
            .end().find( '.form' ).html( formHtml );

        // Create the dialog buttons
        var dialogButtons = {};
        // The delete button
        var deleteFunction = function () {
            // Add an entry to the undo manager
            panels.undoManager.register(
                this,
                function(type, data, container, position){
                    // Readd the panel
                    var panel = $('#panels-dialog').panelsCreatePanel(type, data, container);
                    panels.addPanel(panel, container, position, true);

                    // We don't want to animate the undone panels
                    $( '#panels-container .panel' ).removeClass( 'new-panel' );
                },
                [panel.attr('data-type'), panel.getPanelData(), panel.closest('.panels-container'), panel.index()],
                'Remove Panel'
            );

            // Create the undo notification
            $('#panels-undo-message' ).remove();
            $('<div id="panels-undo-message" class="updated"><p>' + panels.i10n.messages.deleteWidget + ' - <a href="#" class="undo">' + panels.i10n.buttons.undo + '</a></p></div>' )
                .appendTo('body')
                .hide()
                .slideDown()
                .find('a.undo')
                .click(function(){
                    panels.undoManager.undo();
                    $('#panels-undo-message' ).fadeOut(function(){ $(this ).remove() });
                    return false;
                })
            ;

            panel.slideUp( function () {
                $( this ).remove();
                $( '#panels-container .panels-container' ).trigger( 'refreshcells' );
            } );
            dialog.dialog( 'close' );
        };

        // The done button
        dialogButtons[panels.i10n.buttons['done']] = function () {
            $( this ).trigger( 'panelsdone' );

            // Transfer the dialog values across
            dialog.find( '*[name]' ).not( '[data-info-field]' ).each( function () {
                var f = panel.find( '.form *[name="' + $( this ).attr( 'name' ) + '"]' );

                if ( f.attr( 'type' ) == 'checkbox' ) {
                    f.prop( "checked", $( this ).is( ':checked' ) );
                }
                else f.val( $( this ).val() );
            } );

            // Change the title of the panel
            panel.panelsSetPanelTitle();

            dialog.dialog( 'close' );
        }

        dialog = $( '<div class="panel-dialog dialog-form"></div>' )
            .html( formHtml )
            .dialog( {
                dialogClass: 'panels-admin-dialog',
                autoOpen:    false,
                modal:       true,
                title:       panels.i10n.messages.editWidget.replace( '%s', $$.attr( 'data-title' ) ),
                minWidth:    700,
                maxHeight:   Math.round($(window).height() * 0.925),
                create:      function(event, ui){
                    $(this ).closest('.ui-dialog' ).find('.show-in-panels' ).show();
                },
                open:        function () {
                    // Transfer the values of the form to the dialog
                    panel.find( '.form *[name]' ).not( '[data-info-field]' ).each( function () {
                        var f = dialog.find( '*[name="' + $( this ).attr( 'name' ) + '"]' );

                        if ( f.attr( 'type' ) == 'checkbox' ) {
                            f.prop( "checked", $( this ).is( ':checked' ) )
                        }
                        else f.val( $( this ).val() );
                    } );

                    // This gives panel types a chance to influence the form
                    $( this ).trigger( 'panelsopen' );

                    // This fixes a weird a focus issue
                    $(this ).closest('.ui-dialog' ).find('a' ).blur();
                },
                buttons:     dialogButtons
            } )
            .keypress(function(e) {
                if (e.keyCode == $.ui.keyCode.ENTER) {
                    if($(this ).closest('.ui-dialog' ).find('textarea:focus' ).length > 0) return;

                    // This is the same as clicking the add button
                    $(this ).closest('.ui-dialog').find('.ui-dialog-buttonpane .ui-button:eq(0)').click();
                    e.preventDefault();
                    return false;
                }
                else if (e.keyCode === $.ui.keyCode.ESCAPE) {
                    $(this ).closest('.ui-dialog' ).dialog('close');
                }
            });
        
        panel.data('dialog', dialog);

        dialog.find( 'label' ).each( function () {
            // Make labels work as expected
            var f = $( '#' + $( this ).attr( 'for' ) );
            $( this ).disableSelection();

            $( this ).click( function () {
                // Toggle the checked value
                if ( f.attr( 'type' ) == 'checkbox' ) f.prop( 'checked', !f.prop( 'checked' ) );
                else f.focus();
            } );
        } );
        panel.disableSelection();

        // Add the action buttons
        panel.find('.title .actions')
            .append(
                $('<a>edit<a>' ).addClass('edit' ).click(function(){
                    dialog.dialog('open');
                    return false;
                })
            )
            .append(
                $('<a>delete<a>' ).addClass('delete').click(function(){
                    deleteFunction();
                    return false;
                })
            );

        if ( data != undefined ) {
            // Populate the form values
            for ( c in data ) {
                if ( c != 'info' ) {
                    var pe = panel.find( '.form *[name$="[' + c + ']"]' );
                    var de = dialog.find( '*[name$="[' + c + ']"]' );

                    if ( pe.attr( 'type' ) == 'checkbox' ) {
                        pe.prop( 'checked', Boolean( data[c] ) );
                        de.prop( 'checked', Boolean( data[c] ) );
                    }
                    else {
                        pe.val( data[c] );
                        de.val( data[c] );
                    }
                }
            }
        }

        panel.panelsSetPanelTitle();

        // This is to refresh the dialog positions
        $( window ).resize();
        
        return panel;
    }

    panels.addPanel = function(panel, container, position, animate){
        if(container == null) container = $( '#panels-container .cell.cell-selected .panels-container' ).eq(0);
        if(container.length == 0) container = $( '#panels-container .cell .panels-container' ).eq(0);
        if(container.length == 0) return;

        if (position == null) container.append( panel );
        else {
            var current = container.find('.panel' ).eq(position);
            if(current.length == 0) container.append( panel );
            else {
                panel.insertBefore(current);
            }
        }

        container.sortable( "refresh" ).trigger( 'refreshcells' );
        container.closest( '.grid-container' ).panelsResizeCells();
        if(animate) {
            $( '#panels-container .panel.new-panel' ).hide().slideDown( 500 , function(){ panel.data('dialog' ).dialog('open') } ).removeClass( 'new-panel' );
        }
    }

    /**
     * Set the title of the panel
     */
    $.fn.panelsSetPanelTitle = function ( ) {
        return $(this ).each(function(){
            // var titleField = $(this ).data( 'title-field' );
            var titleValue = $(this ).find( 'input[type="text"]').eq(0).val();
            $(this ).find( 'h4' ).html( $(this ).data( 'title' ) + '<span>' + titleValue + '</span>' );
        });
    }

    /**
     * Loads panel data
     *
     * @param data
     */
    panels.loadPanels = function(data){
        panels.clearGrids();

        // Create all the content
        for ( var gi in data.grids ) {
            var cellWeights = [];

            // Get the cell weights
            for ( var ci in data.grid_cells ) {
                if ( Number( data.grid_cells[ci]['grid'] ) == gi ) {
                    cellWeights[cellWeights.length] = Number( data.grid_cells[ci].weight );
                }
            }

            // Create the grids
            var grid = panels.createGrid( Number( data.grids[gi]['cells'] ), cellWeights );

            // Add panels to the grid cells
            for ( var pi in data.widgets ) {

                if ( Number( data.widgets[pi]['info']['grid'] ) == gi ) {
                    var pd = data.widgets[pi];
                    var panel = $('#panels-dialog').panelsCreatePanel( pd['info']['class'], pd );
                    grid
                        .find( '.panels-container' ).eq( Number( data.widgets[pi]['info']['cell'] ) )
                        .append( panel )
                }
            }
        }

        $( '#panels-container .panels-container' )
            .sortable( 'refresh' )
            .trigger( 'refreshcells' );

        // Remove the new-panel class from any of these created panels
        $( '#panels-container .panel' ).removeClass( 'new-panel' );
        
        // Make sure everything is sized properly
        $( '#panels-container .grid-container' ).each( function () {
            $( this ).panelsResizeCells();
        } );
    }
})(jQuery);