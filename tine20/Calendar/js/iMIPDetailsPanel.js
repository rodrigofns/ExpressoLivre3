/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2011-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Calendar');

/**
 * display panel for MIME type text/calendar
 * 
 * NOTE: this panel is registered on Tine.Calendar::init
 * 
 * @namespace   Tine.Calendar
 * @class       Tine.Calendar.iMIPDetailsPanel
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @constructor
 */
Tine.Calendar.iMIPDetailsPanel = Ext.extend(Tine.Calendar.EventDetailsPanel, {
    /**
     * @cfg {Object} preparedPart
     * server prepared text/calendar iMIP part 
     */
    preparedPart: null,
    
    /**
     * @property actionToolbar
     * @type Ext.Toolbar
     */
    actionToolbar: null,
    
    /**
     * @property iMIPrecord
     * @type Tine.Calendar.Model.iMIP
     */
    iMIPrecord: null,
    
    /**
     * @property statusActions
     * @type Array
     */
    statusActions:[],
    
    /**
     * init this component
     */
    initComponent: function() {
        this.app = Tine.Tinebase.appMgr.get('Calendar');

        this.iMIPrecord = new Tine.Calendar.Model.iMIP(this.preparedPart.preparedData);
        if (! Ext.isFunction(this.iMIPrecord.get('event').beginEdit)) {
            this.iMIPrecord.set('event', Tine.Calendar.backend.recordReader({
                responseText: Ext.util.JSON.encode(this.preparedPart.preparedData.event)
            }));
        }

        this.initIMIPToolbar();

        this.on('afterrender', this.showIMIP, this);

        Tine.Calendar.iMIPDetailsPanel.superclass.initComponent.call(this);
    },
    
    /**
     * (re) prepare IMIP
     */
    prepareIMIP: function() {
        this.iMIPclause.setText(this.app.i18n._('Checking Calendar Data...'));
        
        Tine.Calendar.iMIPPrepare(this.iMIPrecord.data, function(result, response) {
            this.preparedPart.preparedData = result;
            if (response.error) {
                // give up!
                this.iMIPrecord.set('preconditions', {'GENERIC': 'generic problem'});
            } else {
                this.iMIPrecord = new Tine.Calendar.Model.iMIP(result);
                this.iMIPrecord.set('event', Tine.Calendar.backend.recordReader({
                    responseText: Ext.util.JSON.encode(result.event)
                }));
            }
            
            this.showIMIP();
        }, this);
    },
    
    /**
     * process IMIP
     * 
     * @param {String} status
     */
    processIMIP: function(status, range) {
        if (this.iMIPrecord.get('event').isRecurBase() && status != 'ACCEPTED' && !range) {
            Tine.widgets.dialog.MultiOptionsDialog.openWindow({
                title: this.app.i18n._('Reply to Recurring Event'),
                questionText: this.app.i18n._('You are responding to an recurring event. What would you like to do?'),
                height: 170,
                scope: this,
                options: [
                    {text: this.app.i18n._('Respond to whole series'), name: 'series'},
                    {text: this.app.i18n._('Do not respond'), name: 'cancel'}
                ],
                
                handler: function(option) {
                    if (option != 'cancel') {
                        this.processIMIP(status, option);
                    }
                }
            });
            return;
        }
        
        Tine.log.debug('Tine.Calendar.iMIPDetailsPanel::processIMIP status: ' + status);
        this.getLoadMask().show();
        
        Tine.Calendar.iMIPProcess(this.iMIPrecord.data, status, function(result, response) {
            this.preparedPart.preparedData = result;
            if (response.error) {
                // precondition changed?  
                return this.prepareIMIP();
            }
            
            // load result
            this.iMIPrecord = new Tine.Calendar.Model.iMIP(result);
            this.iMIPrecord.set('event', Tine.Calendar.backend.recordReader({
                responseText: Ext.util.JSON.encode(result.event)
            }));
            
            this.showIMIP();
        }, this);
    },
    
    /**
     * delegate IMIP
     * 
     * @param {String} status
     * oven event/delegate attendance
     * 
     * @param {Object} event
     */
    delegateAttendance: function(event, range) {
		event = this.iMIPrecord.get('event');

        //this.getLoadMask().show();
	event.set('id', this.iMIPrecord.get('existing_event').id);
	event.set('organizer',this.iMIPrecord.get('existing_event').organizer);
        Ext.each(event.data.attendee, function(attender) {
            Ext.each(this.iMIPrecord.get('existing_event').attendee, function(att) {
                if (att.user_id == attender.user_id.id) {
                    attender.id = att.id;
                }
            }, this);
        }, this);
        event.dirty = false;
        Tine.log.debug('Tine.Calendar.iMIPDetailsPanel::delegateAttendance event: ' + event.id);

        Tine.Calendar.EventEditDialog.openWindow({
            record: Ext.util.JSON.encode(event.data),
            recordId: event.data.id,
            listeners: {
                scope: this,
                update: function (eventJson) {
                    var updatedEvent = Tine.Calendar.backend.recordReader({responseText: eventJson});
                    updatedEvent.dirty = true;
                    updatedEvent.modified = {};
                    event.phantom = true;
                    
                    this.onUpdateEvent(updatedEvent, false);
                }
            }
        });
    },
    
    onUpdateEvent: function(event, pastChecked) {
        
        if(!pastChecked) {
            this.checkPastEvent(event, null);
            return;
        }
        
        if (event.isRecurInstance() || (event.isRecurBase() && ! event.get('rrule').newrule)) {
            Tine.widgets.dialog.MultiOptionsDialog.openWindow({
                title: this.app.i18n._('Update Event'),
                height: 170,
                scope: this,
                options: [
                    {text: this.app.i18n._('Update this event only'), name: 'this'},
                    {text: this.app.i18n._('Update this and all future events'), name: (event.isRecurBase() && ! event.get('rrule').newrule) ? 'series' : 'future'},
                    {text: this.app.i18n._('Update whole series'), name: 'series'},
                    {text: this.app.i18n._('Update nothing'), name: 'cancel'}
                    
                ],
                handler: function(option) {

                    switch (option) {
                        case 'series':
                            var options = {
                                scope: this, 
								success: this.prepareIMIP(),
								failure: this.onProxyFail.createDelegate(this, [event], true)
                            };
                            
                            Tine.Calendar.backend.updateRecurSeries(event, options);
                            break;
                            
                        case 'this':
                        case 'future':
                            var options = {
                                scope: this, 
								success: this.prepareIMIP(),
								failure: this.onProxyFail.createDelegate(this, [event], true)
                            };
                            
                            Tine.Calendar.backend.createRecurException(event, false, option == 'future', options);
                            break;
                            
                        default:
                            break;
                    }

                } 
            });
        } else {
            this.onUpdateEventAction(event);
        }
    },
    
    onUpdateEventAction: function(event) {
            
        Tine.Calendar.backend.saveRecord(event, {
            scope: this, 
			success: this.prepareIMIP(),
			failure: this.onProxyFail.createDelegate(this, [event], true)
        }, {
            checkBusyConflicts: 1
        });
    },

    checkPastEvent: function(event, checkBusyConflicts) {
        
        var start = event.get('dtstart').getTime();
        var morning = new Date().clearTime().getTime();

        var title = this.app.i18n._('Updating event in the past'),
            optionYes = this.app.i18n._('Update this event'),
            optionNo = this.app.i18n._('Do not update this event');
        
        if(start < morning) {
            Tine.widgets.dialog.MultiOptionsDialog.openWindow({                
                title: title,
                height: 170,
                scope: this,
                options: [
                    {text: optionYes, name: 'yes'},
                    {text: optionNo, name: 'no'}                   
                ],
                
                handler: function(option) {
                    try {
                        switch (option) {
                            case 'yes':
                                this.onUpdateEvent(event, true);
                                break;
                            case 'no':
                            default:
								break;                                
                        }
                    } catch (e) {
                        Tine.log.error('Tine.Calendar.MainScreenCenterPanel::checkPastEvent::handler');
                        Tine.log.error(e);
                    }
                }             
            });
        } else {
            this.onUpdateEvent(event, true);
        }
    },
    
    onProxyFail: function(error, event) {
        if(this.loadMask) this.loadMask.hide();
        
        if (error.code == 901) {
           
            // resort fbInfo to combine all events of a attender
            var busyAttendee = [];
            var conflictEvents = {};
            var attendeeStore = Tine.Calendar.Model.Attender.getAttendeeStore(event.get('attendee'));
             
            Ext.each(error.freebusyinfo, function(fbinfo) {
                attendeeStore.each(function(a) {
                    if (a.get('user_type') == fbinfo.user_type && a.getUserId() == fbinfo.user_id) {
                        if (busyAttendee.indexOf(a) < 0) {
                            busyAttendee.push(a);
                            conflictEvents[a.id] = [];
                        }
                        conflictEvents[a.id].push(fbinfo);
                    }
                });
            }, this);
            
            // generate html for each busy attender
            var busyAttendeeHTML = '';
            Ext.each(busyAttendee, function(busyAttender) {
                // TODO refactore name handling of attendee
                //      -> attender model needs knowlege of how to get names!
                //var attenderName = a.getName();
                var attenderName = Tine.Calendar.AttendeeGridPanel.prototype.renderAttenderName.call(Tine.Calendar.AttendeeGridPanel.prototype, busyAttender.get('user_id'), false, busyAttender);
                busyAttendeeHTML += '<div class="cal-conflict-attendername">' + attenderName + '</div>';
                
                var eventInfos = [];
                Ext.each(conflictEvents[busyAttender.id], function(fbInfo) {
                    var format = 'H:i';
                    var dateFormat = Ext.form.DateField.prototype.format;
                    if (event.get('dtstart').format(dateFormat) != event.get('dtend').format(dateFormat) ||
                        Date.parseDate(fbInfo.dtstart, Date.patterns.ISO8601Long).format(dateFormat) != Date.parseDate(fbInfo.dtend, Date.patterns.ISO8601Long).format(dateFormat))
                    {
                        format = dateFormat + ' ' + format;
                    }
                    
                    var eventInfo = Date.parseDate(fbInfo.dtstart, Date.patterns.ISO8601Long).format(format) + ' - ' + Date.parseDate(fbInfo.dtend, Date.patterns.ISO8601Long).format(format);
                    if (fbInfo.event && fbInfo.event.summary) {
                        eventInfo += ' : ' + fbInfo.event.summary;
                    }
                    eventInfos.push(eventInfo);
                }, this);
                busyAttendeeHTML += '<div class="cal-conflict-eventinfos">' + eventInfos.join(', <br />') + '</div>';
                
            });
            
            this.conflictConfirmWin = Tine.widgets.dialog.MultiOptionsDialog.openWindow({
                modal: true,
                allowCancel: false,
                height: 180 + 15*error.freebusyinfo.length,
                title: this.app.i18n._('Scheduling Conflict'),
                questionText: '<div class = "cal-conflict-heading">' +
                                   this.app.i18n._('The following attendee are busy at the requested time:') + 
                               '</div>' +
                               busyAttendeeHTML,
                options: [
                    {text: this.app.i18n._('Ignore Conflict'), name: 'ignore'},
                    {text: this.app.i18n._('Edit Event'), name: 'edit', checked: true},
                    {text: this.app.i18n._('Cancel this action'), name: 'cancel'}
                ],
                scope: this,
                handler: function(option) {

                    switch (option) {
                        case 'ignore':
                            this.onAddEvent(event, false, true);
                            this.conflictConfirmWin.close();
                            break;
                        
                        case 'edit':
                            
/*                            var presentationMatch = this.activeView.match(this.presentationRe),
                                presentation = Ext.isArray(presentationMatch) ? presentationMatch[0] : null;
                            
                            if (presentation != 'Grid') {
                                var view = panel.getView();
                                view.getSelectionModel().select(event);
                                // mark event as not dirty to allow edit dlg
                                event.dirty = false;
                                view.fireEvent('dblclick', view, event);
                            } else {
                                // add or edit?
                                this.onEditInNewWindow(null, null, event);
                            }
*/                            
                            this.delegateAttendance(event, null);

                            this.conflictConfirmWin.close();
                            break;                            
                        case 'cancel':
                        default:
                            this.conflictConfirmWin.close();
                            break;
                    }
                }
            });
            
        } else {
            Tine.Tinebase.ExceptionHandler.handleRequestException(error);
        }
    },
    
    /**
     * iMIP action toolbar
     */
    initIMIPToolbar: function() {
        var singleRecordPanel = this.getSingleRecordPanel();
        
        this.actions = [];
        this.statusActions = [];
        
        Tine.Tinebase.widgets.keyfield.StoreMgr.get('Calendar', 'attendeeStatus').each(function(status) {
            // NEEDS-ACTION is not appropriate in iMIP context
            if (status.id == 'NEEDS-ACTION') return;
            
            this.statusActions.push(new Ext.Action({
                text: status.get('i18nValue'),
                handler: this.processIMIP.createDelegate(this, [status.id]),
                icon: status.get('icon')
            }));
        }, this);

        this.statusActions.push(new Ext.Action({
            text: this.app.i18n._('Open/Delegate'),
            handler: this.delegateAttendance.createDelegate(this, [null]),
            icon: 'images/list-delegate-16x16.png'
        }));
        
        this.actions = this.actions.concat(this.statusActions);
        
        // add more actions here (no spam / apply / crush / send event / ...)
        
        this.iMIPclause = new Ext.Toolbar.TextItem({
            text: ''
        });
        this.tbar = this.actionToolbar = new Ext.Toolbar({
            items: [{
                    xtype: 'tbitem',
                    cls: 'CalendarIconCls',
                    width: 16,
                    height: 16,
                    style: 'margin: 3px 5px 2px 5px;'
                },
                this.iMIPclause,
                '->'
            ].concat(this.actions)
        });
    },
    
    /**
     * show/layout iMIP panel
     */
    showIMIP: function() {
        var singleRecordPanel = this.getSingleRecordPanel(),
            preconditions = this.iMIPrecord.get('preconditions'),
            method = this.iMIPrecord.get('method'),
            event = this.iMIPrecord.get('event'),
            existingEvent = this.iMIPrecord.get('existing_event'),
            myAttenderRecord = event.getMyAttenderRecord(),
            myAttenderstatus = myAttenderRecord ? myAttenderRecord.get('status') : null;
            
        // show container from existing event if exists
        if (existingEvent && existingEvent.container_id) {
            event.set('container_id', existingEvent.container_id);
        }
            
        // reset actions
        Ext.each(this.actions, function(action) {action.setHidden(true)});
        
        // check preconditions
        if (preconditions) {
            if (preconditions.hasOwnProperty('EVENTEXISTS')) {
                this.iMIPclause.setText(this.app.i18n._("The event of this message does not exist"));
            }
            
            else if (preconditions.hasOwnProperty('ORIGINATOR')) {
                // display spam box -> might be accepted by user?
                this.iMIPclause.setText(this.app.i18n._("The sender is not authorised to update the event"));
            }
            
            else if (preconditions.hasOwnProperty('RECENT')) {
//            else if (preconditions.hasOwnProperty('TOPROCESS')) {
                this.iMIPclause.setText(this.app.i18n._("This message is already processed"));
            }
            
            else if (preconditions.hasOwnProperty('ATTENDEE')) {
                // party crush button?
                this.iMIPclause.setText(this.app.i18n._("You are not an attendee of this event"));
            } 
            
            else {
                this.iMIPclause.setText(this.app.i18n._("Unsupported message"));
            }
        } 
        
        // method specific text / actions
        else {
            switch (method) {
                case 'REQUEST':
                    if (! myAttenderRecord) {
                        // might happen in shared folders -> we might want to become a party crusher?
                        this.iMIPclause.setText(this.app.i18n._("This is an event invitation for someone else."));
                    } else if (myAttenderstatus !== 'NEEDS-ACTION') {
                        this.iMIPclause.setText(this.app.i18n._("You have already replied to this event invitation."));
                    } else {
                        this.iMIPclause.setText(this.app.i18n._('You received an event invitation. Set your response to:'));
                        Ext.each(this.statusActions, function(action) {action.setHidden(false)});
                    }
                    break;
                    
                    
                case 'REPLY':
                    // Someone replied => autoprocessing atm.
                    this.iMIPclause.setText(this.app.i18n._('An invited attendee responded to the invitation.'));
                    break;
                    
                default:            
                    this.iMIPclause.setText(this.app.i18n._("Unsupported method"));
                    break;
            }
        }
        
        this.getLoadMask().hide();
        singleRecordPanel.setVisible(true);
        singleRecordPanel.setHeight(150);
        
        
        this.record = event;
        singleRecordPanel.loadRecord(event);
    }
});
