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

  const weightMargin = aircraft.max_gross_weight - totalWeight;
  const weightPercentage = (totalWeight / aircraft.max_gross_weight) * 100;

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
  } else if (weightPercentage > 95) {
    warnings.push({
      type: 'warning',
      title: 'NEAR MAX WEIGHT',
      message: `Aircraft weight is at ${weightPercentage.toFixed(1)}% of maximum gross weight. Only ${weightMargin.toFixed(1)} lbs of margin remaining.`,
      recommendation: 'Consider weight carefully before adding additional items. Plan for fuel burn during flight.'
    });
  } else if (weightPercentage > 90) {
    warnings.push({
      type: 'info',
      title: 'WEIGHT ADVISORY',
      message: `Aircraft weight is at ${weightPercentage.toFixed(1)}% of maximum gross weight (${weightMargin.toFixed(1)} lbs margin).`,
      recommendation: 'Monitor weight closely and ensure proper performance calculations for takeoff and climb.'
    });
  }

  const cgRange = aircraft.cg_aft_limit - aircraft.cg_forward_limit;
  const cgMarginForward = calculatedCG - aircraft.cg_forward_limit;
  const cgMarginAft = aircraft.cg_aft_limit - calculatedCG;

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
  } else if (cgMarginForward < cgRange * 0.1) {
    warnings.push({
      type: 'warning',
      title: 'CG NEAR FORWARD LIMIT',
      message: `Center of gravity is only ${cgMarginForward.toFixed(2)} inches from forward limit.`,
      recommendation: 'Consider moving passengers or cargo rearward for better safety margin.'
    });
  }

  if (isCGAft) {
    const cgDeviation = (calculatedCG - aircraft.cg_aft_limit).toFixed(2);
    warnings.push({
      type: 'critical',
      title: 'CG TOO AFT',
      message: `Center of gravity is ${cgDeviation} inches aft of aft limit (${aircraft.cg_aft_limit} inches).`,
      recommendation: 'Move passengers to forward seats or reduce baggage weight.'
    });
  } else if (cgMarginAft < cgRange * 0.1) {
    warnings.push({
      type: 'warning',
      title: 'CG NEAR AFT LIMIT',
      message: `Center of gravity is only ${cgMarginAft.toFixed(2)} inches from aft limit.`,
      recommendation: 'Consider moving passengers or cargo forward for better safety margin.'
    });
  }

  if (!isCGForward && !isCGAft && cgMarginForward > cgRange * 0.3 && cgMarginAft > cgRange * 0.3) {
    warnings.push({
      type: 'info',
      title: 'OPTIMAL CG POSITION',
      message: `Center of gravity is well-centered within limits (${cgMarginForward.toFixed(2)}" from forward, ${cgMarginAft.toFixed(2)}" from aft).`,
      recommendation: 'Aircraft is optimally balanced for flight characteristics.'
    });
  }

  if (formData.baggageWeight > aircraft.max_baggage_weight) {
    const excessBaggage = formData.baggageWeight - aircraft.max_baggage_weight;
    warnings.push({
      type: 'warning',
      title: 'BAGGAGE OVERWEIGHT',
      message: `Baggage weight exceeds maximum by ${excessBaggage.toFixed(1)} lbs.`,
      recommendation: `Maximum baggage weight is ${aircraft.max_baggage_weight} lbs. Reduce baggage load.`
    });
  } else if (formData.baggageWeight > aircraft.max_baggage_weight * 0.9) {
    const baggageMargin = aircraft.max_baggage_weight - formData.baggageWeight;
    warnings.push({
      type: 'info',
      title: 'BAGGAGE NEAR LIMIT',
      message: `Baggage weight is ${((formData.baggageWeight / aircraft.max_baggage_weight) * 100).toFixed(1)}% of maximum (${baggageMargin.toFixed(1)} lbs margin).`,
      recommendation: 'Verify all baggage is properly secured and within limits.'
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

  if (aircraft.fuel_capacity && formData.fuelOnboard > aircraft.fuel_capacity) {
    const excessFuel = formData.fuelOnboard - aircraft.fuel_capacity;
    warnings.push({
      type: 'critical',
      title: 'FUEL CAPACITY EXCEEDED',
      message: `Fuel onboard (${formData.fuelOnboard} gal) exceeds aircraft capacity by ${excessFuel.toFixed(1)} gallons.`,
      recommendation: `Maximum fuel capacity is ${aircraft.fuel_capacity} gallons. Reduce fuel load.`
    });
  } else if (aircraft.fuel_capacity && formData.fuelOnboard > aircraft.fuel_capacity * 0.95) {
    warnings.push({
      type: 'info',
      title: 'FUEL TANKS NEAR FULL',
      message: `Fuel tanks are ${((formData.fuelOnboard / aircraft.fuel_capacity) * 100).toFixed(1)}% full.`,
      recommendation: 'Verify fuel quantity and ensure proper fuel management during flight.'
    });
  }

  if (formData.fuelOnboard < 5) {
    warnings.push({
      type: 'warning',
      title: 'LOW FUEL WARNING',
      message: `Only ${formData.fuelOnboard} gallons of fuel onboard.`,
      recommendation: 'Ensure sufficient fuel for flight plus required reserves (typically 30-45 minutes).'
    });
  }

  const row1Passengers = passengers.filter(p => p.rowNumber === 1);
  const row2Passengers = passengers.filter(p => p.rowNumber === 2);
  const row3Passengers = passengers.filter(p => p.rowNumber === 3);

  const hasRow2 = aircraft.passenger_row2_arm > 0;
  const hasRow3 = aircraft.passenger_row3_arm > 0;

  if (hasRow3 && row3Passengers.length > 0 && row1Passengers.length === 0 && row2Passengers.length === 0) {
    warnings.push({
      type: 'warning',
      title: 'PASSENGERS ONLY IN REAR',
      message: 'All passengers are in the rear row with no forward passengers.',
      recommendation: 'Consider moving some passengers forward for better weight distribution.'
    });
  }

  if (row1Passengers.length > 0 && hasRow2 && row2Passengers.length === 0 && hasRow3 && row3Passengers.length > 0) {
    warnings.push({
      type: 'info',
      title: 'PASSENGERS IN FRONT AND REAR ONLY',
      message: 'Passengers are loaded in front and rear rows with middle row empty.',
      recommendation: 'Verify this is the intended loading configuration.'
    });
  }

  if (totalPassengerWeight === 0 && passengers.length === 0 && !isOverweight) {
    warnings.push({
      type: 'info',
      title: 'NO PASSENGERS',
      message: 'No passengers loaded for this flight.',
      recommendation: 'Verify this is correct for the intended operation.'
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
