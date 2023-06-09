class Controller {
    model;
    //TODO rename to frontend to avoid confusion
    view;
    eventHandlers = [
        //Initial view event handlers
        [this.addRoleEvent, this.removeRoleEvent, this.moveUpRoleEvent, this.moveDownRoleEvent, this.checkboxOnClick, this.doneWithRoles],
        //Night view
        [this.wakeUpNextRole],
        //Day view
        []
    ];
    
    constructor(model, view){
        if(!model instanceof Model){
            throw new TypeError("model parameter must be an instance of Model.");
        }
        if(!view instanceof View){
            throw new TypeError("view parameter must be an instance of View.");
        }
        this.model = model;
        this.view = view;
    }

    //Event handlers for initial view:
    addRoleEvent(e){
        e.preventDefault();
        try{
            //This is an event handler for the form, to the this keyword refers to
            //the form that triggered the event
            controller.model.addRole(this.roleName.value, parseInt(this.roleAmount.value));
            controller.view.redraw();
        } catch(e){
            if(e instanceof ReferenceError){
                alert(e.message);
            } else {
                throw e;
            }
        }
    }

    removeRoleEvent(e){
        //                   button td element    tr element    td with name
        var roleNameToRemove = this.parentElement.parentElement.children[0].innerText;
        controller.model.removeRole(roleNameToRemove);
        controller.view.redoRoleNamesList();
        controller.view.redraw();
    }

    moveUpRoleEvent(e){
        var roleNameToMove = this.parentElement.parentElement.children[0].innerText;
        controller.model.moveUpRole(roleNameToMove);
        controller.view.redraw();
    }

    moveDownRoleEvent(e){
        var roleNameToMove = this.parentElement.parentElement.children[0].innerText;
        controller.model.moveDownRole(roleNameToMove);
        controller.view.redraw();
    }

    checkboxOnClick(e){
        controller.model.useDefaultRoleSorting = this.checked;
        controller.view.redraw();
    }

    doneWithRoles(e){
        controller.model.startFirstNight();
        controller.view.loadView(NightView, controller.eventHandlers[1]);
    }

    wakeUpNextRole(e){
        e.preventDefault();
        var form = e.target;
        var playerNames = [];
        var oldIndexes = [];
        var inputElements = form.querySelectorAll(".identSection>input");
        for(var element of inputElements){
            if(playerNames.value == "" || element.type != "text") continue;
            playerNames.push(element.value);
            oldIndexes.push(element.getAttribute("oldindex"));
        }

        var targetElements = form.querySelectorAll(".targetSection>input");
        
        if(controller.model.roles[controller.model.currentRoleToWakeUp] instanceof Witch){
            //TODO handle witch input when I get there
            //First checks if healTargets exists and then checks for the value
            if(form.healTargets && form.healTargets.value != "Niemand"){
                controller.model.enterTarget(form.healTargets.value, true);
            }
            
            if(form.target0 && form.target0.value != ""){
                controller.model.enterTarget(form.target0.value, false);
            }
        } else {
            for(var element of targetElements){
                controller.model.enterTarget(element.value);
            }
        }
        
        controller.model.identifyPlayers(playerNames, oldIndexes);

        try{
            controller.model.wakeUpNextRole();
        }
        catch(e){
            if(!(e instanceof RangeError)){
                throw e;
            }
        }
        
        if(controller.model.currentRoleToWakeUp >= controller.model.roles.length){
            controller.model.calculateKillProposalsFromTargets();
            controller.view.loadView(DayView, controller.eventHandlers[2]);
            return;
        }
        controller.view.redraw();
    }

    amountIdentifiedChanged(){
        //Redraw if current view is daytime
    }
}