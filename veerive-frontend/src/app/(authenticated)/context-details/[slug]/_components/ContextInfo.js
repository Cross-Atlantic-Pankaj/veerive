'use client';

import React from 'react';
import Link from 'next/link';
import PDFPageSlideshow from '../../../../../components/PDFPageSlideshow';

const ContextInfo = ({ context, currentSlide, setCurrentSlide, sliderRef }) => {
	// Debug logging
	console.log('ContextInfo: Context data:', {
		contextTitle: context?.contextTitle,
		pdfUrl: context?.pdfUrl,
		pptUrl: context?.pptUrl,
		pdfFile: context?.pdfFile,
		hasSlider: context?.hasSlider,
		slides: context?.slides?.length || 0,
		contextId: context?._id
	});

	const slugify = (text) => {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^\w-]+/g, '')
			.replace(/--+/g, '-')
			.replace(/^-+|-+$/g, '');
	};
	const nextSlide = () => {
		if (!context || !context.slides || !context.slides.length) return;
		setCurrentSlide((prev) =>
			prev === context.slides.length - 1 ? 0 : prev + 1
		);
	};

	const prevSlide = () => {
		if (!context || !context.slides || !context.slides.length) return;
		setCurrentSlide((prev) =>
			prev === 0 ? context.slides.length - 1 : prev - 1
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
			<h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 ml-2">
				{context.contextTitle}
			</h1>

			{(context.originalContextSector?.length > 0 ||
				context.originalContextSubSector?.length > 0) && (
				<div className="flex flex-wrap gap-1 sm:gap-2 mt-2 mb-2 sm:mb-3">
					{context.originalContextSector?.map((sector, index) => (
						<Link
							key={`sector-${sector._id || index}`}
							href={`/pulse-today?sector=${encodeURIComponent(sector)}`}
							className="p-2 sm:p-2 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
						>
							{sector}
						</Link>
					))}
					{context.originalContextSubSector?.map((subSector, index) => (
						<Link
							key={`subsector-${subSector._id || index}`}
							href={`/pulse-today?subSector=${encodeURIComponent(subSector)}`}
							className="p-2 sm:p-2 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
						>
							{subSector}
						</Link>
					))}
				</div>
			)}

			{(context.originalContextSignalCategory?.length > 0 ||
				context.originalContextSignalSubCategory?.length > 0) && (
				<div className="flex flex-wrap gap-1 sm:gap-2 mt-2 mb-2 sm:mb-3">
					{context.originalContextSignalCategory?.map((signal, index) => (
						<Link
							key={`signal-${signal._id || index}`}
							href={`/pulse-today?signalCategory=${encodeURIComponent(signal)}`}
							className="p-2 sm:p-2 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
						>
							{signal}
						</Link>
					))}
					{context.originalContextSignalSubCategory?.map((subSignal, index) => (
						<Link
							key={`subsignal-${subSignal._id || index}`}
							href={`/pulse-today?signalSubCategory=${encodeURIComponent(subSignal)}`}
							className="p-2 sm:p-2 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
						>
							{subSignal}
						</Link>
					))}
				</div>
			)}

			{context.originalTheme && (
				<div className="bg-[#f1f8ff] p-2 sm:p-3 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2 sm:gap-4">
					<Link 
						href={`/analyzer/theme-details/${slugify(context.originalTheme.themeTitle)}`}
						className="text-sm sm:text-base text-[#174c77] font-medium hover:text-[#0f3a5c] transition-colors cursor-pointer"
					>
						Theme: {context.originalTheme.themeTitle}
					</Link>
					<div className="flex flex-wrap gap-2 sm:gap-4">
						<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-1 sm:px-2 py-1 gap-1 sm:gap-2">
							<div className="text-xs sm:text-sm text-[#174c77] leading-tight text-center">
								Disruption Potential
							</div>
							<div className="bg-[#f76c3c] text-white font-bold w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded">
								{context.originalTheme.impactScore}
							</div>
						</div>
						<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-1 sm:px-2 py-1 gap-1 sm:gap-2">
							<div className="text-xs sm:text-sm text-[#174c77] leading-tight text-center">
								Predictive Momentum
							</div>
							<div className="bg-[#f76c3c] text-white font-bold w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded">
								{context.originalTheme.predictiveMomentumScore}
							</div>
						</div>
						<div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-1 sm:px-2 py-1 gap-1 sm:gap-2">
							<div className="text-xs sm:text-sm text-[#174c77] leading-tight text-center">
								Trending Pulse
							</div>
							<div className="bg-[#f76c3c] text-white font-semibold w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded">
								{context.originalTheme.trendingScore}
							</div>
						</div>
					</div>
				</div>
			)}

			{context.summary && context.summary.length > 0 && (
				<div className="mb-4 sm:mb-6 ml-2">
					<h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Summary:</h2>
					<ul className="text-gray-700 list-disc list-inside text-sm sm:text-base">
						<div dangerouslySetInnerHTML={{ __html: context.summary }} />
					</ul>
				</div>
			)}

			{/* Display PDF Slideshow if pdfFile is present */}
			{context.pdfFile && context.pdfFile.fileName && (
				<div className="mt-6 sm:mt-8 mb-4 sm:mb-6">
					<PDFPageSlideshow
						contextId={context._id}
						className="w-full max-w-4xl mx-auto"
					/>
				</div>
			)}

			{/* Display slides if hasSlider is true and no pdfFile */}
			{!context.pdfFile && context.hasSlider && context.slides && context.slides.length > 0 && (
				<div
					className="relative mt-6 sm:mt-8 mb-4 sm:mb-6 bg-slate-700 text-white rounded-lg overflow-hidden"
					ref={sliderRef}
				>
					<div className="h-full relative">
						<div className="p-2 sm:p-4 md:p-6 h-full flex flex-col justify-center md:px-20">
							<h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
								{context.slides[currentSlide].title}
							</h3>
							<p
								dangerouslySetInnerHTML={{
									__html: context.slides[currentSlide].description,
								}}
								className="text-gray-100 text-sm sm:text-base"
							></p>
						</div>
						<div className="flex justify-between items-center p-2 sm:p-4 md:p-0 md:absolute md:inset-y-0 md:w-full md:pointer-events-none">
{context.slides.length > 1 &&(
							<button
								onClick={prevSlide}
								className="md:absolute md:left-2 md:top-1/2 md:transform md:-translate-y-1/2 bg-orange-500 text-white p-2 sm:p-3 rounded-full hover:bg-orange-600 transition-colors md:pointer-events-auto"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 sm:h-5 w-4 sm:w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
)}
{context.slides.length > 1 &&(
							<button
								onClick={nextSlide}
								className="md:absolute md:right-2 md:top-1/2 md:transform md:-translate-y-1/2 bg-orange-500 text-white p-2 sm:p-3 rounded-full hover:bg-orange-600 transition-colors md:pointer-events-auto"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 sm:h-5 w-4 sm:w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
)}
						</div>
						<div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
							{
								context.slides.length > 1 &&(
							context.slides.map((_, idx) => (
								<button
									key={`slide-${idx}`}
									onClick={() => setCurrentSlide(idx)}
									className={`w-2 h-2 rounded-full ${
										currentSlide === idx ? 'bg-white' : 'bg-gray-400'
									}`
								}
								/>
							)))

							}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ContextInfo;