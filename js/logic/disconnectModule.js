export default function disconnectModule(module) {
    if (!module) return

    // go to the neighboors and check if there are pointing back to the same direction as cable 
    if (module.outcomingCables) {
        // slice(0): little trick to delete element from array while iterating thru
        module.outcomingCables.slice(0).forEach(cable => {
            cable.deleteCable()
        });
        module.outcomingCables = undefined;
    }

    if (module.incomingCables) {
        module.incomingCables.slice(0).forEach(cable => {
            cable.deleteCable()
        });
        module.incomingCables = undefined;
    }
    if (module.onDisconnect)
        module.onDisconnect();
}