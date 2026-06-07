'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
	TypeOne,
	TypeTwo,
	TypeThree,
	TypeFour,
	TypeFive,
	TypeNum,
} from './_components';
import ContextImage from '@/components/ContextImage';
import { parseJsxCode, Tile } from '../../../utils/Tile';

export default function SavedItems() {
	const [savedItems, setSavedItems] = useState({
		contexts: [],
		posts: [],
		themes: [],
	});
	const [previousSavedItems, setPreviousSavedItems] = useState({
		contexts: [],
		posts: [],
		themes: [],
	});
	const [savedStatus, setSavedStatus] = useState({
		contexts: {},
		posts: {},
		themes: {},
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isContentLoading, setIsContentLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [sectorSignalData, setSectorSignalData] = useState({
		sectors: [],
		signals: [],
	});
	const [expandedSectors, setExpandedSectors] = useState({});
	const [expandedSignals, setExpandedSignals] = useState({});
	const [showMoreSectors, setShowMoreSectors] = useState(false);
	const [showMoreSignals, setShowMoreSignals] = useState(false);
	const [showMoreSubsectors, setShowMoreSubsectors] = useState({});
	const [showMoreSubsignals, setShowMoreSubsignals] = useState({});
	const [selectedSectorId, setSelectedSectorId] = useState(null);
	const [selectedSubsectorId, setSelectedSubsectorId] = useState(null);
	const [selectedSignalId, setSelectedSignalId] = useState(null);
	const [selectedSubsignalId, setSelectedSubsignalId] = useState(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const router = useRouter();

	const getUserEmail = () => {
		const userDataStr = localStorage.getItem('user');
		if (userDataStr) {
			const user = JSON.parse(userDataStr);
			return user.email;
		}
		return null;
	};

	const normalizeTitle = (text) => {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\$/g, 'dollar')
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/--+/g, '-')
			.replace(/^-+|-+$/g, '');
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const fetchSavedItems = async () => {
		const userDataStr = localStorage.getItem('user');
		if (!userDataStr) {
			setError('User not logged in');
			setIsLoading(false);
			setIsContentLoading(false);
			return;
		}

		const { email } = JSON.parse(userDataStr);
		if (!email) {
			setError('User email not found');
			setIsLoading(false);
			setIsContentLoading(false);
			return;
		}

		try {
			const queryParams = new URLSearchParams();
			if (selectedSectorId) queryParams.append('sectorId', selectedSectorId);
			if (selectedSubsectorId)
				queryParams.append('subsectorId', selectedSubsectorId);
			if (selectedSignalId) queryParams.append('signalId', selectedSignalId);
			if (selectedSubsignalId)
				queryParams.append('subsignalId', selectedSubsignalId);

			const url = `/api/user-saved-items?${queryParams.toString()}`;
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			const data = await response.json();
			if (response.ok) {
				const newSavedItems = {
					contexts: data.savedItems.contexts || [],
					posts: data.savedItems.posts || [],
					themes: data.savedItems.themes || [],
				};
				const hasNewItems =
					newSavedItems.contexts.length > 0 ||
					newSavedItems.posts.length > 0 ||
					newSavedItems.themes.length > 0;

				if (hasNewItems) {
					setPreviousSavedItems(newSavedItems);
				} else {
					const hasPrevItems =
						previousSavedItems.contexts.length > 0 ||
						previousSavedItems.posts.length > 0 ||
						previousSavedItems.themes.length > 0;
					if (!hasPrevItems) {
						setPreviousSavedItems({ contexts: [], posts: [], themes: [] });
					}
				}
				setSavedItems(newSavedItems);
				setSavedStatus({
					contexts: Object.fromEntries(
						newSavedItems.contexts.map((context) => [context._id, true])
					),
					posts: Object.fromEntries(
						newSavedItems.posts.map((post) => [post._id, true])
					),
					themes: Object.fromEntries(
						newSavedItems.themes.map((theme) => [theme._id, true])
					),
				});
			} else {
				throw new Error(data.error || 'Failed to fetch saved items');
			}
		} catch (err) {
			console.error('Error fetching saved items:', err);
			setError(err.message);
			toast.error(err.message);
		} finally {
			setIsLoading(false);
			setIsContentLoading(false);
		}
	};

	useEffect(() => {
		const fetchSectorSignalData = async () => {
			const email = getUserEmail();
			if (!email) {
				setError('User email not found');
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/ProfileSectorSignal?email=${encodeURIComponent(email)}`
				);
				const data = await response.json();
				if (data.success) {
					setSectorSignalData(data.data);
				} else {
					throw new Error(
						data.error || 'Failed to fetch sector and signal data'
					);
				}
			} catch (err) {
				console.error('Error fetching sector and signal data:', err);
				setError(err.message);
				toast.error('Error fetching sector and signal data');
				setIsLoading(false);
			}
		};

		fetchSectorSignalData();
		fetchSavedItems();
	}, []);

	useEffect(() => {
		setIsContentLoading(true);
		fetchSavedItems();
	}, [
		selectedSectorId,
		selectedSubsectorId,
		selectedSignalId,
		selectedSubsignalId,
	]);

	const handleUnsaveContext = async (contextId) => {
		const email = getUserEmail();
		if (!email) {
			router.push('/login');
			return;
		}

		try {
			const response = await fetch('/api/context-save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ contextId, email, action: 'unsave' }),
			});
			const data = await response.json();
			if (response.ok) {
				setSavedItems((prev) => ({
					...prev,
					contexts: prev.contexts.filter(
						(context) => context._id !== contextId
					),
				}));
				setPreviousSavedItems((prev) => ({
					...prev,
					contexts: prev.contexts.filter(
						(context) => context._id !== contextId
					),
				}));
				setSavedStatus((prev) => ({
					...prev,
					contexts: { ...prev.contexts, [contextId]: false },
				}));
				toast.success(data.message);
				await fetchSavedItems();
			} else {
				toast.error(data.error || 'Failed to unsave context');
			}
		} catch (error) {
			console.error('Error unsaving context:', error);
			toast.error('Error unsaving context');
		}
	};

	const handleUnsavePost = async (postId) => {
		const email = getUserEmail();
		if (!email) {
			router.push('/login');
			return;
		}

		try {
			const response = await fetch('/api/post-save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ postId, email, action: 'unsave' }),
			});
			const data = await response.json();
			if (response.ok) {
				setSavedItems((prev) => ({
					...prev,
					posts: prev.posts.filter((post) => post._id !== postId),
				}));
				setPreviousSavedItems((prev) => ({
					...prev,
					posts: prev.posts.filter((post) => post._id !== postId),
				}));
				setSavedStatus((prev) => ({
					...prev,
					posts: { ...prev.posts, [postId]: false },
				}));
				toast.success(data.message);
				await fetchSavedItems();
			} else {
				toast.error(data.error || 'Failed to unsave post');
			}
		} catch (error) {
			console.error('Error unsaving post:', error);
			toast.error('Error unsaving post');
		}
	};

	const handleUnsaveTheme = async (themeId) => {
		const email = getUserEmail();
		if (!email) {
			router.push('/login');
			return;
		}

		try {
			const response = await fetch('/api/theme-save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ themeId, email, action: 'unsave' }),
			});
			const data = await response.json();
			if (response.ok) {
				setSavedItems((prev) => ({
					...prev,
					themes: prev.themes.filter((theme) => theme._id !== themeId),
				}));
				setPreviousSavedItems((prev) => ({
					...prev,
					themes: prev.themes.filter((theme) => theme._id !== themeId),
				}));
				setSavedStatus((prev) => ({
					...prev,
					themes: { ...prev.themes, [themeId]: false },
				}));
				toast.success(data.message);
				await fetchSavedItems();
			} else {
				toast.error(data.error || 'Failed to unsave theme');
			}
		} catch (error) {
			console.error('Error unsaving theme:', error);
			toast.error('Error unsaving theme');
		}
	};

	const handleShareContext = async (context) => {
		try {
			const slug = context.contextTitle
				? normalizeTitle(context.contextTitle)
				: `context-${context._id}`;
			const shareData = {
				title: context.contextTitle,
				text: `Check out this context: ${
					context.contextTitle
				}\nSectors: ${context.sectorNames.join(
					', '
				)}\nSub-Sectors: ${context.subSectorNames.join(', ')}`,
				url: window.location.origin + `/context-details/${slug}`,
			};

			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				const shareText = `${
					context.contextTitle
				}\n\nSectors: ${context.sectorNames.join(
					', '
				)}\nSub-Sectors: ${context.subSectorNames.join(
					', '
				)}\n\nCheck out this context: ${
					window.location.origin
				}/context-details/${slug}`;
				await navigator.clipboard.writeText(shareText);
				toast.success('Link copied to clipboard!');
			}
		} catch (error) {
			console.error('Error sharing context:', error);
			toast.error('Error sharing context');
		}
	};

	const handleSharePost = async (post) => {
		try {
			const shareData = {
				title: post.postTitle,
				text: post.summary,
				url: post.sourceUrl,
			};

			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				const shareText = `${post.postTitle}\n\n${post.summary}\n\nRead more: ${post.sourceUrl}`;
				await navigator.clipboard.writeText(shareText);
				toast.success('Link copied to clipboard!');
			}
		} catch (error) {
			console.error('Error sharing post:', error);
			toast.error('Error sharing post');
		}
	};

	const handleShareTheme = async (theme) => {
		try {
			const slugified = theme.themeTitle
				.toString()
				.toLowerCase()
				.trim()
				.replace(/\s+/g, '-')
				.replace(/[^\w-]+/g, '')
				.replace(/--+/g, '-')
				.replace(/^-+|-+$/g, '');

			const shareData = {
				title: theme.themeTitle,
				text: `Check out this trend: ${theme.themeTitle}`,
				url: window.location.origin + `/analyzer/theme-details/${slugified}`,
			};

			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				const shareText = `${theme.themeTitle}\n\nCheck out this trend: ${window.location.origin}/analyzer/theme-details/${slugified}`;
				await navigator.clipboard.writeText(shareText);
				toast.success('Link copied to clipboard!');
			}
		} catch (error) {
			console.error('Error sharing theme:', error);
			toast.error('Error sharing theme');
		}
	};

	const toggleSector = (sectorId) => {
		setExpandedSectors((prev) => ({
			...prev,
			[sectorId]: !prev[sectorId],
		}));
	};

	const toggleSignal = (signalId) => {
		setExpandedSignals((prev) => ({
			...prev,
			[signalId]: !prev[signalId],
		}));
	};

	const toggleMoreSubsectors = (sectorId) => {
		setShowMoreSubsectors((prev) => ({
			...prev,
			[sectorId]: !prev[sectorId],
		}));
	};

	const toggleMoreSubsignals = (signalId) => {
		setShowMoreSubsignals((prev) => ({
			...prev,
			[signalId]: !prev[signalId],
		}));
	};

	const handleSectorClick = (sectorId) => {
		if (selectedSectorId === sectorId && !selectedSubsectorId) {
			setSelectedSectorId(null);
		} else {
			setSelectedSectorId(sectorId);
			setSelectedSubsectorId(null);
		}
		setSelectedSignalId(null);
		setSelectedSubsignalId(null);
		setIsMobileMenuOpen(false); // Close mobile menu
	};

	const handleSubsectorClick = (subsectorId, parentSectorId) => {
		if (selectedSubsectorId === subsectorId) {
			setSelectedSubsectorId(null);
		} else {
			setSelectedSubsectorId(subsectorId);
			setSelectedSectorId(parentSectorId);
		}
		setSelectedSignalId(null);
		setSelectedSubsignalId(null);
		setIsMobileMenuOpen(false); // Close mobile menu
	};

	const handleSignalClick = (signalId) => {
		if (selectedSignalId === signalId && !selectedSubsignalId) {
			setSelectedSignalId(null);
		} else {
			setSelectedSignalId(signalId);
			setSelectedSubsignalId(null);
		}
		setSelectedSectorId(null);
		setSelectedSubsectorId(null);
		setIsMobileMenuOpen(false); // Close mobile menu
	};

	const handleSubsignalClick = (subsignalId, parentSignalId) => {
		if (selectedSubsignalId === subsignalId) {
			setSelectedSubsignalId(null);
		} else {
			setSelectedSubsignalId(subsignalId);
			setSelectedSignalId(parentSignalId);
		}
		setSelectedSectorId(null);
		setSelectedSubsectorId(null);
		setIsMobileMenuOpen(false); // Close mobile menu
	};

	const handleRemoveFilter = (filterType) => {
		let newCategory = selectedCategory;
		let newSectorId = selectedSectorId;
		let newSubsectorId = selectedSubsectorId;
		let newSignalId = selectedSignalId;
		let newSubsignalId = selectedSubsignalId;

		switch (filterType) {
			case 'category':
				newCategory = null;
				setSelectedCategory(null);
				break;
			case 'sector':
				newSectorId = null;
				newSubsectorId = null;
				setSelectedSectorId(null);
				setSelectedSubsectorId(null);
				break;
			case 'subsector':
				newSubsectorId = null;
				setSelectedSubsectorId(null);
				break;
			case 'signal':
				newSignalId = null;
				newSubsignalId = null;
				setSelectedSignalId(null);
				setSelectedSubsignalId(null);
				break;
			case 'subsignal':
				newSubsignalId = null;
				setSelectedSubsignalId(null);
				break;
			default:
				break;
		}

		setSavedItems(previousSavedItems);
		setIsContentLoading(true);
		fetchSavedItems();
	};

	const selectedSector = selectedSectorId
		? sectorSignalData.sectors.find((s) => s._id === selectedSectorId)
				?.sectorName
		: null;
	const selectedSubsector = selectedSubsectorId
		? sectorSignalData.sectors
				.flatMap((s) => s.subsectors)
				.find((sub) => sub._id === selectedSubsectorId)?.subSectorName
		: null;
	const selectedSignal = selectedSignalId
		? sectorSignalData.signals.find((s) => s._id === selectedSignalId)
				?.signalName
		: null;
	const selectedSubsignal = selectedSubsignalId
		? sectorSignalData.signals
				.flatMap((s) => s.subsignals)
				.find((sub) => sub._id === selectedSubsignalId)?.subSignalName
		: null;

	const hasItems =
		savedItems.contexts.length > 0 ||
		savedItems.posts.length > 0 ||
		savedItems.themes.length > 0;

	const hasPreviousItems =
		previousSavedItems.contexts.length > 0 ||
		previousSavedItems.posts.length > 0 ||
		previousSavedItems.themes.length > 0;

	const groupedContexts = {
		'Type-Two': [],
		'Type-Three': [],
		'Type-Four': [],
		'Type-Five': [],
		'Type-Num': [],
		'Type-One': [],
	};

	savedItems.contexts.forEach((context, index) => {
		const type = context.containerType || 'Type-One';
		groupedContexts[type].push({ ...context, index });
	});

	const containerTypes = [
		'Type-Two',
		'Type-Three',
		'Type-Four',
		'Type-Five',
		'Type-Num',
		'Type-One',
	];

	const categories = [
		{ name: 'Events', key: 'contexts' },
		{ name: 'Think Tank', key: 'posts' },
		{ name: 'Trends', key: 'themes' },
	];

	const getNoItemsMessage = () => {
		if (!selectedCategory) return null;
		switch (selectedCategory) {
			case 'contexts':
				return 'No contexts available.';
			case 'posts':
				return 'No posts available.';
			case 'themes':
				return 'No themes available.';
			default:
				return null;
		}
	};

	const hasItemsInSelectedCategory = () => {
		if (!selectedCategory) return true;
		switch (selectedCategory) {
			case 'contexts':
				return savedItems.contexts.length > 0;
			case 'posts':
				return savedItems.posts.length > 0;
			case 'themes':
				return savedItems.themes.length > 0;
			default:
				return false;
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full mt-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full mt-8 text-red-600 text-center">Error: {error}</div>
		);
	}

	return (
		<div className="w-full bg-gray-50 min-h-screen sm:px-0">
			<div className="text-center mt-4 sm:mt-6 mb-3 sm:mb-4 px-4 sm:px-0">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-800">Saved Items</h1>
			</div>

			{/* Main Content */}
			{!hasPreviousItems ? (
				<div className="w-full mt-2 text-gray-600 text-center text-sm sm:text-base px-4 sm:px-0">
					No items Saved.
				</div>
			) : (
				<div className="relative">
					{/* Mobile Filter Button */}
					<div className="lg:hidden sticky top-0 z-40 px-4 mb-4 flex justify-center items-center">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="flex items-center gap-2 bg-gray-200 p-2 rounded-lg text-black"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
								/>
							</svg>
							<span className="font-medium">Filters</span>
						</button>
					</div>

					<div className="flex flex-col lg:flex-row sm:px-6 lg:px-12 relative">
						{/* Mobile Sidebar Overlay */}
						{isMobileMenuOpen && (
							<div
								className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
								onClick={() => setIsMobileMenuOpen(false)}
							/>
						)}

						{/* Left Sidebar */}
						<div
							className={`
								fixed lg:static top-0 left-0 h-fit lg:h-auto
								w-80 sm:w-96 lg:w-1/4 
								bg-white shadow-md lg:shadow-md 
								p-6 lg:p-6 
								my-0 lg:my-5 
								rounded-none lg:rounded-lg
								transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
								transition-transform duration-300 ease-in-out
								z-50 lg:z-auto
								overflow-y-auto lg:overflow-visible
								lg:h-fit
							`}
						>
							{/* Mobile Close Button */}
							<div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b">
								<h2 className="text-lg font-bold text-gray-700">Filters</h2>
								<button
									onClick={() => setIsMobileMenuOpen(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							{/* Categories Section */}
							<div className="mb-4">
								<h2 className="text-lg font-bold text-gray-700 mb-4 bg-gray-200 px-2 py-1 rounded-sm">
									Categories
								</h2>
								<ul className="space-y-3">
									{categories.map((category) => (
										<li key={category.key}>
											<button
												onClick={() => {
													setSelectedCategory(category.key);
													setIsMobileMenuOpen(false); // Close mobile menu
												}}
												className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
													selectedCategory === category.key
														? 'bg-purple-100 text-purple-700'
														: 'text-gray-700 hover:bg-gray-100'
												}`}
											>
												{category.name}
											</button>
										</li>
									))}
								</ul>
							</div>

							{/* Sectors Section */}
							<div className="mb-4">
								<h2 className="text-lg font-bold text-gray-700 mb-4 bg-gray-200 px-2 py-1 rounded-sm">
									Sectors
								</h2>
								<ul className="space-y-2">
								{sectorSignalData.sectors
									.slice(0, showMoreSectors ? undefined : 5)
									.map((sector) => (
										<li key={sector._id}>
											<div className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
												<span className="text-sm font-medium text-gray-700">
													{sector.sectorName}
												</span>
												<button
													onClick={() => toggleSector(sector._id)}
													className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors duration-200"
												>
													{expandedSectors[sector._id] ? '−' : '+'}
												</button>
											</div>
											{expandedSectors[sector._id] && (
												<div className="ml-4 mt-2 space-y-2">
													<button
														onClick={() => handleSectorClick(sector._id)}
														className={`text-sm font-semibold text-gray-800 hover:text-purple-700 transition-colors duration-200 ${
															selectedSectorId === sector._id &&
															!selectedSubsectorId
																? 'text-purple-700'
																: ''
														}`}
													>
														{sector.sectorName}
													</button>
													<ul className="space-y-1">
														{sector.subsectors
															.slice(
																0,
																showMoreSubsectors[sector._id] ? undefined : 4
															)
															.map((subsector) => (
																<li key={subsector._id}>
																	<button
																		onClick={() =>
																			handleSubsectorClick(
																				subsector._id,
																				sector._id
																			)
																		}
																		className={`text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200 ${
																			selectedSubsectorId === subsector._id
																				? 'text-purple-700'
																				: ''
																		}`}
																	>
																		{subsector.subSectorName}
																	</button>
																</li>
															))}
														{sector.subsectors.length > 4 && (
															<li>
																<button
																	onClick={() =>
																		toggleMoreSubsectors(sector._id)
																	}
																	className="text-purple-600 hover:text-purple-800 text-sm font-medium"
																>
																	{showMoreSubsectors[sector._id]
																		? 'Less'
																		: 'More'}
																</button>
															</li>
														)}
													</ul>
												</div>
											)}
										</li>
									))}
								{sectorSignalData.sectors.length > 5 && (
									<li>
										<button
											onClick={() => setShowMoreSectors(!showMoreSectors)}
											className="text-purple-600 hover:text-purple-800 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
										>
											{showMoreSectors ? 'Less' : 'More'}
										</button>
									</li>
								)}
								</ul>
							</div>

							{/* Signals Section */}
							<div>
								<h2 className="text-lg font-bold text-gray-700 mb-4 bg-gray-200 px-2 py-1 rounded-sm">
									Signals
								</h2>
							<ul className="space-y-2">
								{sectorSignalData.signals
									.slice(0, showMoreSignals ? undefined : 5)
									.map((signal) => (
										<li key={signal._id}>
											<div className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
												<span className="text-sm font-medium text-gray-700">
													{signal.signalName}
												</span>
												<button
													onClick={() => toggleSignal(signal._id)}
													className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors duration-200"
												>
													{expandedSignals[signal._id] ? '−' : '+'}
												</button>
											</div>
											{expandedSignals[signal._id] && (
												<div className="ml-4 mt-2 space-y-2">
													<button
														onClick={() => handleSignalClick(signal._id)}
														className={`text-sm font-semibold text-gray-800 hover:text-purple-700 transition-colors duration-200 ${
															selectedSignalId === signal._id &&
															!selectedSubsignalId
																? 'text-purple-700'
																: ''
														}`}
													>
														{signal.signalName}
													</button>
													<ul className="space-y-1">
														{signal.subsignals
															.slice(
																0,
																showMoreSubsignals[signal._id] ? undefined : 4
															)
															.map((subsignal) => (
																<li key={subsignal._id}>
																	<button
																		onClick={() =>
																			handleSubsignalClick(
																				subsignal._id,
																				signal._id
																			)
																		}
																		className={`text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200 ${
																			selectedSubsignalId === subsignal._id
																				? 'text-purple-700'
																				: ''
																		}`}
																	>
																		{subsignal.subSignalName}
																	</button>
																</li>
															))}
														{signal.subsignals.length > 4 && (
															<li>
																<button
																	onClick={() =>
																		toggleMoreSubsignals(signal._id)
																	}
																	className="text-purple-600 hover:text-purple-800 text-sm font-medium"
																>
																	{showMoreSubsignals[signal._id]
																		? 'Less'
																		: 'More'}
																</button>
															</li>
														)}
													</ul>
												</div>
											)}
										</li>
									))}
								{sectorSignalData.signals.length > 5 && (
									<li>
										<button
											onClick={() => setShowMoreSignals(!showMoreSignals)}
											className="text-purple-600 hover:text-purple-800 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
										>
											{showMoreSignals ? 'Less' : 'More'}
										</button>
									</li>
								)}
								</ul>
							</div>
						</div>

						{/* Right Content */}
						<div className="w-full lg:w-3/4 p-2 lg:p-4 lg:my-5">
						<div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 items-center">
							{selectedCategory && (
								<div className="flex items-center bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
									<span>
										{categories.find((c) => c.key === selectedCategory)?.name}
									</span>
									<button
										onClick={() => handleRemoveFilter('category')}
										className="ml-1 sm:ml-2 text-purple-800 hover:text-purple-600"
									>
										×
									</button>
								</div>
							)}
							{selectedSectorId && !selectedSubsectorId && (
								<div className="flex items-center bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
									<span className="truncate max-w-[100px] sm:max-w-none">{selectedSector}</span>
									<button
										onClick={() => handleRemoveFilter('sector')}
										className="ml-1 sm:ml-2 text-purple-800 hover:text-purple-600 flex-shrink-0"
									>
										×
									</button>
								</div>
							)}
							{selectedSubsectorId && (
								<div className="flex items-center bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
									<span className="truncate max-w-[120px] sm:max-w-none">{`${selectedSector} > ${selectedSubsector}`}</span>
									<button
										onClick={() => handleRemoveFilter('subsector')}
										className="ml-1 sm:ml-2 text-purple-800 hover:text-purple-600 flex-shrink-0"
									>
										×
									</button>
								</div>
							)}
							{selectedSignalId && !selectedSubsignalId && (
								<div className="flex items-center bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
									<span className="truncate max-w-[100px] sm:max-w-none">{selectedSignal}</span>
									<button
										onClick={() => handleRemoveFilter('signal')}
										className="ml-1 sm:ml-2 text-purple-800 hover:text-purple-600 flex-shrink-0"
									>
										×
									</button>
								</div>
							)}
							{selectedSubsignalId && (
								<div className="flex items-center bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
									<span className="truncate max-w-[120px] sm:max-w-none">{`${selectedSignal} > ${selectedSubsignal}`}</span>
									<button
										onClick={() => handleRemoveFilter('subsignal')}
										className="ml-1 sm:ml-2 text-purple-800 hover:text-purple-600 flex-shrink-0"
									>
										×
									</button>
								</div>
							)}
						</div>
						<div className="space-y-6">
							{isContentLoading ? (
								<div className="flex justify-center items-center w-full mt-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
								</div>
							) : hasItems ? (
								<>
									{/* Contexts */}
									{(!selectedCategory || selectedCategory === 'contexts') && (
										<>
											{containerTypes.map((type) =>
												groupedContexts[type].length > 0 ? (
													<div
														key={type}
														className="w-full space-y-4"
													>
														{type === 'Type-One' ? (
															<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
																{groupedContexts[type].map(
																	({ index, ...context }) => (
																		<TypeOne
																			key={context._id}
																			context={{ ...context, id: context._id }}
																			handleUnsave={handleUnsaveContext}
																			handleShare={handleShareContext}
																		/>
																	)
																)}
															</div>
														) : (
															groupedContexts[type].map(
																({ index, ...context }) => {
																	const props = {
																		context: { ...context, id: context._id },
																		handleUnsave: handleUnsaveContext,
																		handleShare: handleShareContext,
																	};
																	switch (type) {
																		case 'Type-Two':
																			return (
																				<TypeTwo
																					key={context._id}
																					{...props}
																				/>
																			);
																		case 'Type-Three':
																			return (
																				<TypeThree
																					key={context._id}
																					{...props}
																				/>
																			);
																		case 'Type-Four':
																			return (
																				<TypeFour
																					key={context._id}
																					{...props}
																				/>
																			);
																		case 'Type-Five':
																			return (
																				<TypeFive
																					key={context._id}
																					{...props}
																				/>
																			);
																		case 'Type-Num':
																			return (
																				<TypeNum
																					key={context._id}
																					{...props}
																				/>
																			);
																		default:
																			return null;
																	}
																}
															)
														)}
													</div>
												) : null
											)}
											{selectedCategory === 'contexts' &&
												savedItems.contexts.length === 0 && (
													<div className="w-full mt-6 sm:mt-8 text-gray-600 text-center text-sm sm:text-base px-4 sm:px-0">
														No contexts available.
													</div>
												)}
										</>
									)}

									{/* Posts */}
									{(!selectedCategory || selectedCategory === 'posts') && (
										<>
											{savedItems.posts.length > 0 ? (
												<div className="w-full space-y-4 sm:space-y-6">
													{savedItems.posts.map((post, index) => (
														<div
															key={`${post._id}-${index}`}
															className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200"
														>
															<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-2 gap-2 sm:gap-0">
																<div className="flex flex-wrap gap-1 sm:gap-2">
																	{post.sectorNames
																		.slice(0, 3)
																		.map((sector, i) => (
																			<span
																				key={`${sector}-${i}`}
																				className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-2 py-1 rounded-full"
																			>
																				{sector}
																			</span>
																		))}
																</div>
																<span className="text-gray-500 text-xs sm:text-sm">
																	{formatDate(post.date || new Date())}
																</span>
															</div>
															<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
																{post.postTitle}
															</h2>
															<p className="text-gray-600 text-xs sm:text-sm mb-2">
																{post.sourceName} | {post.postType}
															</p>
															<div className="text-gray-700 mb-4">
																<p
																	dangerouslySetInnerHTML={{
																		__html: post.summary,
																	}}
																/>
															</div>
															<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
																<a
																	href={post.sourceUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-block bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 text-xs sm:text-sm font-medium text-center"
																>
																	Read More <span className="ml-1">→</span>
																</a>
																<button
																	onClick={() => handleUnsavePost(post._id)}
																	className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium ${
																		savedStatus.posts[post._id]
																			? 'bg-green-100 text-green-700'
																			: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
																	}`}
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"
																		fill={
																			savedStatus.posts[post._id]
																				? 'currentColor'
																				: 'none'
																		}
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
																		/>
																	</svg>
																	{savedStatus.posts[post._id]
																		? 'Saved'
																		: 'Save'}
																</button>
																<button
																	onClick={() => handleSharePost(post)}
																	className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-200 text-xs sm:text-sm font-medium"
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
																		/>
																	</svg>
																	Share
																</button>
															</div>
														</div>
													))}
												</div>
											) : selectedCategory === 'posts' ? (
												<div className="w-full mt-6 sm:mt-8 text-gray-600 text-center text-sm sm:text-base px-4 sm:px-0">
													No posts available.
												</div>
											) : null}
										</>
									)}

									{/* Themes */}
									{(!selectedCategory || selectedCategory === 'themes') && (
										<>
											{savedItems.themes.length > 0 ? (
												<div className="w-full space-y-6">
													<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-10">
														{savedItems.themes.map((theme) => {
															const slugified = theme.themeTitle
																.toString()
																.toLowerCase()
																.trim()
																.replace(/\s+/g, '-')
																.replace(/[^\w-]+/g, '')
																.replace(/--+/g, '-')
																.replace(/^-+|-+$/g, '');

															const tileProps =
																theme.tileTemplates &&
																theme.tileTemplates.jsxCode
																	? parseJsxCode(theme.tileTemplates.jsxCode)
																	: null;

															return (
																<div
																	key={theme._id}
																	className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
																	onClick={() =>
																		router.push(
																			`/analyzer/theme-details/${slugified}`
																		)
																	}
																>
																	<ContextImage
																		theme={theme}
																		tileTemplate={tileProps}
																		className="w-full h-[120px] sm:h-[140px] lg:h-[160px] rounded-t-lg"
																		fallbackText="1000 × 630"
																	/>

																	{/* <div className="relative w-full h-[160px]">
                                    <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                      1000 x 630
                                    </div>
                                  </div> */}

																	<div className="p-3 sm:p-4 lg:p-5">
																		{theme.themeTitle && (
																			<h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
																				{theme.themeTitle}
																			</h2>
																		)}

																		<div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4 bg-gray-50 rounded-lg overflow-hidden">
																			<div className="p-2 sm:p-3 text-center border-r border-white">
																				<div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
																					Trending <br className="hidden sm:block" />
																					<span className="sm:hidden"> </span>Pulse
																				</div>
																				<div className="text-sm sm:text-base font-bold text-blue-600">
																					{theme.trendingScore?.toFixed(2) ||
																						'N/A'}
																				</div>
																			</div>

																			<div className="p-2 sm:p-3 text-center border-r border-white">
																				<div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
																					Disruption Potential
																				</div>
																				<div className="text-sm sm:text-base font-bold text-purple-600">
																					{theme.impactScore?.toFixed(2) ||
																						'N/A'}
																				</div>
																			</div>

																			<div className="p-2 sm:p-3 text-center">
																				<div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
																					Predictive Momentum
																				</div>
																				<div className="text-sm sm:text-base font-bold text-indigo-600">
																					{theme.predictiveMomentumScore?.toFixed(
																						2
																					) || 'N/A'}
																				</div>
																			</div>
																		</div>

																		<div className="space-y-2 sm:space-y-3">
																			{theme.sectorNames?.length > 0 && (
																				<div className="flex flex-wrap gap-1 sm:gap-2">
																					{theme.sectorNames.map(
																						(sector, index) => (
																							<span
																								key={`${sector}-${index}`}
																								className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium inline-flex items-center"
																							>
																								{sector}
																							</span>
																						)
																					)}
																				</div>
																			)}

																			{theme.subSectorNames?.length > 0 && (
																				<div className="flex flex-wrap gap-1 sm:gap-2">
																					{theme.subSectorNames.map(
																						(subSector, index) => (
																							<span
																								key={`${subSector}-${index}`}
																								className="px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium inline-flex items-center"
																							>
																								{subSector}
																							</span>
																						)
																					)}
																				</div>
																			)}
																		</div>

																		<div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
																			<button
																				onClick={(e) => {
																					e.stopPropagation();
																					handleUnsaveTheme(theme._id);
																				}}
																				className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium ${
																					savedStatus.themes[theme._id]
																						? 'bg-green-100 text-green-700'
																						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
																				}`}
																			>
																				<svg
																					xmlns="http://www.w3.org/2000/svg"
																					className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"
																					fill={
																						savedStatus.themes[theme._id]
																							? 'currentColor'
																							: 'none'
																					}
																					viewBox="0 0 24 24"
																					stroke="currentColor"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
																					/>
																				</svg>
																				{savedStatus.themes[theme._id]
																					? 'Saved'
																					: 'Save'}
																			</button>
																			<button
																				onClick={(e) => {
																					e.stopPropagation();
																					handleShareTheme(theme);
																				}}
																				className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-200 text-xs sm:text-sm font-medium"
																			>
																				<svg
																					xmlns="http://www.w3.org/2000/svg"
																					className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"
																					fill="none"
																					viewBox="0 0 24 24"
																					stroke="currentColor"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
																					/>
																				</svg>
																				Share
																			</button>
																		</div>
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											) : selectedCategory === 'themes' ? (
												<div className="w-full mt-6 sm:mt-8 text-gray-600 text-center text-sm sm:text-base px-4 sm:px-0">
													No themes available.
												</div>
											) : null}
										</>
									)}
								</>
							) : (
								<div className="w-full mt-6 sm:mt-8 text-gray-600 text-center text-sm sm:text-base px-4 sm:px-0">
									{getNoItemsMessage() ||
										'No saved items found for this filter.'}
								</div>
							)}
						</div>
					</div>
				</div>
				</div>
			)}
		</div>
	);
}
