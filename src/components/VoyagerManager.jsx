import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Mission Timeline dates
// Launch: Aug 20, 1977
// Jupiter: July 9, 1979 (+ ~2 years)
// Saturn: Aug 25, 1981 (+ ~4 years)
// Uranus: Jan 24, 1986 (+ ~8.5 years)
// Neptune: Aug 25, 1989 (+ ~12 years)

export default function VoyagerManager({ isVoyager, onPhaseChange, timerRef, speed, launchTrigger }) {
    const timeRef = useRef(null) // Null means "Pre-Launch"

    // Config for simulation speed: 
    // Normalized: 1 sim year = 1 real second at 1x speed (Sim Scale)
    const SEC_PER_YEAR = 1.0

    // Watch for launch signal
    useEffect(() => {
        if (launchTrigger) {
            timeRef.current = 0 // Start immediately
        }
    }, [launchTrigger])

    // Reset when toggled on/off
    useEffect(() => {
        if (!isVoyager) {
            timeRef.current = null
        }
    }, [isVoyager])

    const currentPhase = useRef('parked')

    const setPhase = (phase) => {
        if (currentPhase.current !== phase) {
            currentPhase.current = phase
            onPhaseChange(phase)
        }
    }

    const lastState = useRef({ date: '', event: '' })

    const updateTimer = (date, event) => {
        if (timerRef.current) {
            if (lastState.current.date !== date) {
                if (timerRef.current.setDate) timerRef.current.setDate(date)
                lastState.current.date = date
            }
            if (lastState.current.event !== event) {
                if (timerRef.current.setEvent) timerRef.current.setEvent(event)
                lastState.current.event = event
            }
        }
    }

    useFrame((state, delta) => {
        if (!isVoyager || !timerRef.current) return

        // If Launch hasn't triggered yet, or waiting
        // But with current logic, timeRef is 0 immediately.
        // If timeRef is null, we do nothing (return).
        if (timeRef.current === null) {
            updateTimer("Ready for Launch", "Status: Nominal")
            setPhase('parked')
            return
        }

        // Accumulate time (years)
        // delta is in seconds.
        const effectiveDelta = delta * speed
        timeRef.current += (effectiveDelta / SEC_PER_YEAR)

        const yearsPassed = timeRef.current
        const startYear = 1977.64 // Aug 1977
        const currentYear = startYear + yearsPassed

        // Format Date
        const yearInt = Math.floor(currentYear)
        const monthProg = (currentYear % 1) * 12
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const dateStr = `${months[Math.floor(monthProg)]} ${yearInt}`

        let eventStr = ""
        // Events & Orbital Shifts based on Trajectory 2.0 (Piecewise Linear)
        // Milestones: Jupiter (1.7), Saturn (3.5), Uranus (8.0), Neptune (12.0)

        if (yearsPassed < 1.5) {
            eventStr = yearsPassed < 0.1 ? "LIFTOFF" : "Cruise to Jupiter"
            setPhase('launch')
        }
        else if (yearsPassed < 2.0) { // Jupiter is at 1.7
            eventStr = "Jupiter Flyby"
            setPhase('jupiter')
        }
        else if (yearsPassed < 3.2) {
            eventStr = "Cruise to Saturn"
            setPhase('jupiter') // Keep focus on Jupiter or transition? Stay for now.
        }
        else if (yearsPassed < 3.8) { // Saturn is at 3.5
            eventStr = "Saturn Flyby"
            setPhase('saturn')
        }
        else if (yearsPassed < 7.7) {
            eventStr = "Cruise to Uranus"
            setPhase('saturn')
        }
        else if (yearsPassed < 8.3) { // Uranus is at 8.0
            eventStr = "Uranus Flyby"
            setPhase('uranus')
        }
        else if (yearsPassed < 11.7) {
            eventStr = "Cruise to Neptune"
            setPhase('uranus')
        }
        else if (yearsPassed < 12.3) { // Neptune is at 12.0
            eventStr = "Neptune Flyby"
            setPhase('neptune')
        }
        else {
            eventStr = "Interstellar Mission"
            setPhase('neptune')
        }

        updateTimer(dateStr, eventStr)
    })

    return null
}
