export function calculateWeightAndBalance(aircraft, formData, passengers) {
  if (!aircraft) return null;

  const warnings = [];

  const pilotMoment = formData.pilotWeight * aircraft.pilot_station_arm;
  const fuelWeight = formData.fuelOnboard * aircraft.fuel_weight_per_gallon;
  const fuelMoment = fuelWeight * aircraft.fuel_arm;
  const baggageMoment = formData.baggageWeight * aircraft.baggage_arm;

  let passengerMoments = 0;
  let totalPassengerWeight = 0;

  passengers.forEach(passenger => {
    let arm = 0;
    if (passenger.rowNumber === 1 && aircraft.passenger_row1_arm) {
      arm = aircraft.passenger_row1_arm;
    } else if (passenger.rowNumber === 2 && aircraft.passenger_row2_arm) {
      arm = aircraft.passenger_row2_arm;
    } else if (passenger.rowNumber === 3 && aircraft.passenger_row3_arm) {
      arm = aircraft.passenger_row3_arm;
    }

    passengerMoments += passenger.weight * arm;
    totalPassengerWeight += passenger.weight;
  });

  const totalWeight = aircraft.basic_empty_weight + formData.pilotWeight +
                      fuelWeight + totalPassengerWeight + formData.baggageWeight;

  const totalMoment = (aircraft.basic_empty_weight * ((aircraft.cg_forward_limit + aircraft.cg_aft_limit) / 2)) +
                      pilotMoment + fuelMoment + passengerMoments + baggageMoment;

  const calculatedCG = totalMoment / totalWeight;

  const isOverweight = totalWeight > aircraft.max_gross_weight;
  const isCGForward = calculatedCG < aircraft.cg_forward_limit;
  const isCGAft = calculatedCG > aircraft.cg_aft_limit;

  if (isOverweight) {
    const excessWeight = totalWeight - aircraft.max_gross_weight;
    warnings.push({
      type: 'critical',
      title: 'AIRCRAFT OVERWEIGHT',
      message: `Aircraft is ${excessWeight.toFixed(1)} lbs over maximum gross weight of ${aircraft.max_gross_weight} lbs.`,
      recommendation: 'Reduce passenger count, baggage weight, or fuel load.'
    });

    const fuelToBurn = Math.ceil(excessWeight / aircraft.fuel_weight_per_gallon);
    if (fuelWeight > fuelToBurn * aircraft.fuel_weight_per_gallon) {
      warnings.push({
        type: 'warning',
        title: 'BURN FUEL',
        message: `Consider burning approximately ${fuelToBurn} gallons of fuel to meet weight requirements.`,
        recommendation: 'Run engines for ground operations or reduce fuel load.'
      });
    }
  }

  if (isCGForward) {
    const cgDeviation = (aircraft.cg_forward_limit - calculatedCG).toFixed(2);
    warnings.push({
      type: 'critical',
      title: 'CG TOO FORWARD',
      message: `Center of gravity is ${cgDeviation} inches forward of forward limit (${aircraft.cg_forward_limit} inches).`,
      recommendation: 'Move passengers to rear seats or add ballast to baggage compartment.'
    });

    const ballastNeeded = Math.ceil(
      (aircraft.cg_forward_limit - calculatedCG) * totalWeight /
      (aircraft.baggage_arm - calculatedCG)
    );

    if (ballastNeeded > 0 && ballastNeeded < 200) {
      warnings.push({
        type: 'warning',
        title: 'ADD BALLAST',
        message: `Add approximately ${ballastNeeded} lbs of ballast to baggage compartment.`,
        recommendation: 'Use certified ballast weights and secure properly.'
      });
    }
  }

  if (isCGAft) {
    const cgDeviation = (calculatedCG - aircraft.cg_aft_limit).toFixed(2);
    warnings.push({
      type: 'critical',
      title: 'CG TOO AFT',
      message: `Center of gravity is ${cgDeviation} inches aft of aft limit (${aircraft.cg_aft_limit} inches).`,
      recommendation: 'Move passengers to forward seats or reduce baggage weight.'
    });
  }

  if (formData.baggageWeight > aircraft.max_baggage_weight) {
    const excessBaggage = formData.baggageWeight - aircraft.max_baggage_weight;
    warnings.push({
      type: 'warning',
      title: 'BAGGAGE OVERWEIGHT',
      message: `Baggage weight exceeds maximum by ${excessBaggage.toFixed(1)} lbs.`,
      recommendation: `Maximum baggage weight is ${aircraft.max_baggage_weight} lbs.`
    });
  }

  if (passengers.length > aircraft.max_passengers) {
    warnings.push({
      type: 'critical',
      title: 'TOO MANY PASSENGERS',
      message: `Passenger count (${passengers.length}) exceeds aircraft capacity (${aircraft.max_passengers}).`,
      recommendation: 'Remove passengers to meet aircraft limitations.'
    });
  }

  const isWithinLimits = !isOverweight && !isCGForward && !isCGAft &&
                         formData.baggageWeight <= aircraft.max_baggage_weight &&
                         passengers.length <= aircraft.max_passengers;

  return {
    totalWeight: totalWeight.toFixed(1),
    calculatedCG: calculatedCG.toFixed(2),
    isWithinLimits,
    warnings,
    fuelWeight: fuelWeight.toFixed(1),
    totalPassengerWeight: totalPassengerWeight.toFixed(1),
    weightMargin: (aircraft.max_gross_weight - totalWeight).toFixed(1),
    cgMarginForward: (calculatedCG - aircraft.cg_forward_limit).toFixed(2),
    cgMarginAft: (aircraft.cg_aft_limit - calculatedCG).toFixed(2)
  };
}

export function getWarningColor(type) {
  switch (type) {
    case 'critical':
      return '#dc2626';
    case 'warning':
      return '#ea580c';
    case 'info':
      return '#0891b2';
    default:
      return '#6b7280';
  }
}
