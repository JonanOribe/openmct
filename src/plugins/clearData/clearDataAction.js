/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2021, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

function inSelectionPath(openmct, domainObject) {
    return openmct.selection.get().some(selectionPath => {
        const domainObjectIdentifier = domainObject.identifier;

        return selectionPath.some(objectInPath => {
            const objectInPathIdentifier = objectInPath.context.item.identifier;
            const idsAreEqual = openmct.objects.areIdsEqual(objectInPathIdentifier, domainObjectIdentifier);

            return idsAreEqual;
        });
    });
}

export default class ClearDataAction {
    constructor(openmct, appliesToObjects) {
        this.name = 'Clear Data for Object';
        this.key = 'clear-data-action';
        this.description = 'Clears current data for object, unsubscribes and resubscribes to data';
        this.cssClass = 'icon-clear-data';

        this._openmct = openmct;
        this._appliesToObjects = appliesToObjects;
    }
    invoke(objectPath) {
        let domainObject = null;
        if (objectPath) {
            domainObject = objectPath[0];
        }

        this._openmct.objectViews.emit('clearData', domainObject);
    }
    appliesTo(objectPath) {
        if (!objectPath) {
            return false;
        }

        const contextualDomainObject = objectPath[0];
        const appliesToThisObject = this._appliesToObjects.some(type => {
            return contextualDomainObject.type === type;
        });
        const objectInSelectionPath = inSelectionPath(this._openmct, contextualDomainObject)
        if (appliesToThisObject) {
            // check to see if contextualDomainObject matches what's selected in tree
            if (objectInSelectionPath) {
                return true;
            } else {
                // if this it doesn't match up, lastly check to see if we're in a composition
                console.debug(`Should check for composition parent in path`);
                const routerPath = this._openmct.router.path[0];
                console.debug(`routerPath - ${JSON.stringify(routerPath)}`);
                return routerPath.type === 'layout';
            }
        }

        return false;
    }
}
