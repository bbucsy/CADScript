import React, { useEffect, useRef } from 'react'

export const SketchDisplay: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const drawCoordinateSystem = (canvas: HTMLCanvasElement) => {
		const ctx = canvas.getContext('2d')
		if (ctx == null) return

		// Clear canvas
		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		// Translate origin to the center of the canvas
		ctx.translate(canvas.width / 2, canvas.height / 2)

		// Draw x-axis
		ctx.beginPath()
		ctx.moveTo(-canvas.width / 2, 0)
		ctx.lineTo(canvas.width / 2, 0)
		ctx.strokeStyle = 'black'
		ctx.stroke()

		// Draw y-axis
		ctx.beginPath()
		ctx.moveTo(0, -canvas.height / 2)
		ctx.lineTo(0, canvas.height / 2)
		ctx.strokeStyle = 'black'
		ctx.stroke()

		// Draw tick marks on x-axis
		for (let x = -canvas.width / 2; x <= canvas.width / 2; x += 20) {
			ctx.beginPath()
			ctx.moveTo(x, -5)
			ctx.lineTo(x, 5)
			ctx.stroke()
		}

		// Draw tick marks on y-axis
		for (let y = -canvas.height / 2; y <= canvas.height / 2; y += 20) {
			ctx.beginPath()
			ctx.moveTo(-5, y)
			ctx.lineTo(5, y)
			ctx.stroke()
		}

		// Reset transformation matrix to the identity matrix
		ctx.setTransform(1, 0, 0, 1, 0, 0)
	}

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		drawCoordinateSystem(canvas)
	}, [])

	return <canvas ref={canvasRef} width={512} height={512} style={{ width: '100%' }} />
}
