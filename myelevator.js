/*
 * Available information:
 * 1. Request queue
 * Simulator.get_instance().get_requests()
 * Array of integers representing floors where there are people calling the elevator
 * eg: [7,3,2] // There are 3 people waiting for the elevator at floor 7,3, and 2, in that order
 * 
 * 2. Elevator object
 * To get all elevators, Simulator.get_instance().get_building().get_elevator_system().get_elevators()
 * Array of Elevator objects.
 * - Current floor
 * elevator.at_floor()
 * Returns undefined if it is moving and returns the floor if it is waiting.
 * - Destination floor
 * elevator.get_destination_floor()
 * The floor the elevator is moving toward.
 * - Position
 * elevator.get_position()
 * Position of the elevator in y-axis. Not necessarily an integer.
 * - Elevator people
 * elevator.get_people()
 * Array of people inside the elevator
 * 
 * 3. Person object
 * - Floor
 * person.get_floor()
 * - Destination
 * person.get_destination_floor()
 * - Get time waiting for an elevator
 * person.get_wait_time_out_elevator()
 * - Get time waiting in an elevator
 * person.get_wait_time_in_elevator()
 * 
 * 4. Time counter
 * Simulator.get_instance().get_time_counter()
 * An integer increasing by 1 on every simulation iteration
 * 
 * 5. Building
 * Simulator.get_instance().get_building()
 * - Number of floors
 * building.get_num_floors()
 */

Elevator.prototype.decide = function () {
    var simulator = Simulator.get_instance();
    var building = simulator.get_building();
    var num_floors = building.get_num_floors();
    var elevators = Simulator.get_instance().get_building().get_elevator_system().get_elevators();
    var time_counter = simulator.get_time_counter();
    var requests = simulator.get_requests();

    var elevator = this;
    // get people inside elevator
    var people = this.get_people();

    if (elevator) {
        var elevatorCurrentFloor = elevator.at_floor();
        var elevatordestinationFloor = elevator.get_destination_floor();
        var elevatorPosition = elevator.get_position();
    }

    // **************SERVE PERSON**************
    // find nearest person destination floor
    var person = people.length > 0 ? people[0] : undefined;
    if (person) {
        for (var i = 0; i < people.length; i++) {
            if (Math.abs(people[i].get_destination_floor() - elevator.at_floor()) <
                Math.abs(person.get_destination_floor() - elevator.at_floor())) {
                person = people[i];
            }
        }
        person.get_floor();
        // serve person. go to destination floor 
        // reorder 
        return this.commit_decision(person.get_destination_floor());
    }


    // **************SERVE REQUEST**************
    for (var i = 0; i < requests.length; i++) {
        var handled = false;

        // find floor request that haven't been handled yet
        for (var j = 0; j < elevators.length; j++) {
            var elev = elevators[j];

            var req = requests[i];
            // if has been handled, break, go to next request
            if (elev.get_destination_floor() == req) {
                handled = true;
                break;
            }
        }

        // let handle unhandled request
        if (!handled) {
            var nearestElev = elevator;
            // find nearest elevator to take the person
            for (var j = 0; j < elevators.length; j++) {
                var elev = elevators[j];
                var destElev = elev.get_destination_floor();
                var reqFloor = requests[i];

                if ((Math.abs(destElev - reqFloor) < Math.abs(nearestElev.get_destination_floor() - reqFloor)) &&
                    elev.people.length < elev.max_num_people) {
                    nearestElev = elev;
                }
            }
            return nearestElev.commit_decision(requests[i]);
        }
    }

    return this.commit_decision(Math.floor(num_floors / 2));
};
