'use client';

import { AuditResultData } from './AuditResults';

interface ContentEvaluationProps {
  data: AuditResultData;
}

interface EvaluationResult {
  category: string;
  passed: boolean;
  score: number;
  maxScore: number;
  details: {
    check: string;
    passed: boolean;
    recommendation?: string;
  }[];
}

export default function ContentEvaluation({ data }: ContentEvaluationProps) {
  // Evaluate title
  const titleEvaluation = evaluateTitle(data.title);
  
  // Evaluate bullet points
  const bulletPointsEvaluation = evaluateBulletPoints(data.bulletPoints);
  
  // Evaluate description
  const descriptionEvaluation = evaluateDescription(data.description);
  
  // Evaluate images, videos and enhanced content
  const imagesEvaluation = evaluateImages(data.imageCount, data.videoCount, data.hasEnhancedContent);
  
  // Calculate overall score
  const evaluations = [titleEvaluation, bulletPointsEvaluation, descriptionEvaluation, imagesEvaluation];
  const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
  const maxPossibleScore = evaluations.reduce((sum, evaluation) => sum + evaluation.maxScore, 0);
  const overallPercentage = Math.round((totalScore / maxPossibleScore) * 100);
  
  // Determine overall status
  let overallStatus = 'Poor';
  let statusColor = 'text-red-600';
  
  if (overallPercentage >= 90) {
    overallStatus = 'Excellent';
    statusColor = 'text-green-600';
  } else if (overallPercentage >= 75) {
    overallStatus = 'Good';
    statusColor = 'text-green-500';
  } else if (overallPercentage >= 50) {
    overallStatus = 'Fair';
    statusColor = 'text-amber-500';
  }

  // Update status colors for dark theme
  if (statusColor === 'text-green-600') statusColor = 'text-green-400';
  else if (statusColor === 'text-green-500') statusColor = 'text-green-500';
  else if (statusColor === 'text-amber-500') statusColor = 'text-amber-400';
  else statusColor = 'text-red-400';

  return (
    <div className="w-full h-full backdrop-blur-lg bg-white/10 shadow-lg rounded-3xl p-6 border border-white/20 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-400">Alan Evaluation</h2>
        <div className="flex items-center backdrop-blur-md bg-black/20 rounded-xl p-3 border border-white/10">
          <div className="text-right mr-3">
            <div className="text-xs text-gray-300">Score</div>
            <div className={`text-2xl font-bold ${statusColor}`}>{overallPercentage}%</div>
          </div>
          <div className={`px-3 py-1 rounded-full backdrop-blur-md ${statusColor === 'text-green-400' ? 'bg-green-900/30 border-green-500/30' : statusColor === 'text-green-500' ? 'bg-green-900/30 border-green-500/30' : statusColor === 'text-amber-400' ? 'bg-amber-900/30 border-amber-500/30' : 'bg-red-900/30 border-red-500/30'} border`}>
            <span className={`text-xs font-medium ${statusColor}`}>{overallStatus}</span>
          </div>
        </div>
      </div>
      
      {/* Render each evaluation section */}
      <div className="space-y-4 max-h-[calc(100vh-220px)]">
        {evaluations.map((evaluation, index) => (
          <EvaluationSection key={index} evaluation={evaluation} />
        ))}
      </div>
    </div>
  );
}

function EvaluationSection({ evaluation }: { evaluation: EvaluationResult }) {
  const percentage = Math.round((evaluation.score / evaluation.maxScore) * 100);
  
  // Update colors for dark theme
  const passedColor = evaluation.passed ? 'text-green-400' : 'text-red-400';
  const progressBarColor = evaluation.passed ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className="mb-4 pb-4 border-b border-white/10 last:border-0 last:mb-0 last:pb-0">
      <div className="flex justify-between items-center mb-2 backdrop-blur-md bg-black/20 rounded-xl p-3 border border-white/10">
        <h3 className="font-medium text-green-400 text-base">{evaluation.category}</h3>
        <div className="flex items-center">
          <span className={`text-xs font-medium ${passedColor}`}>
            {evaluation.score}/{evaluation.maxScore}
          </span>
          <div className="ml-2 w-20 bg-gray-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${progressBarColor}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 backdrop-blur-md bg-black/20 rounded-xl p-3 border border-white/10">
        {evaluation.details.map((detail, index) => (
          <div key={index} className="flex items-start">
            <div className={`mt-0.5 mr-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${detail.passed ? 'bg-green-900/50 border-green-500/30' : 'bg-red-900/50 border-red-500/30'} shadow-md border`}>
              {detail.passed ? (
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">{detail.check}</p>
              {!detail.passed && detail.recommendation && (
                <p className="text-sm text-red-400 mt-0.5 ml-1">{detail.recommendation}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Title evaluation function
function evaluateTitle(title: string): EvaluationResult {
  const details = [];
  let score = 0;
  const maxScore = 5;
  
  // Check title length (max 200 characters)
  const isLengthValid = title.length > 0 && title.length <= 200;
  details.push({
    check: 'Title length is within 200 characters',
    passed: isLengthValid,
    recommendation: isLengthValid ? undefined : 'Shorten title to 200 characters or less'
  });
  if (isLengthValid) score++;
  
  // Check for promotional phrases
  const hasPromotionalPhrases = /\b(best|amazing|top|perfect|incredible|awesome|excellent|free|discount|sale|offer|limited|new|improved)\b/i.test(title);
  details.push({
    check: 'No promotional phrases',
    passed: !hasPromotionalPhrases,
    recommendation: hasPromotionalPhrases ? 'Remove promotional phrases like "best", "amazing", etc.' : undefined
  });
  if (!hasPromotionalPhrases) score++;
  
  // Check for excessive punctuation
  const hasExcessivePunctuation = /[!$?_{}^¬¦]{2,}/.test(title) || /[!$?_{}^¬¦]/.test(title);
  details.push({
    check: 'No excessive punctuation or prohibited symbols',
    passed: !hasExcessivePunctuation,
    recommendation: hasExcessivePunctuation ? 'Remove excessive punctuation and prohibited symbols' : undefined
  });
  if (!hasExcessivePunctuation) score++;
  
  // Check for proper capitalization
  const hasProperCapitalization = /^[A-Z]/.test(title) && !/\b(a|an|the|in|on|at|for|with|by|to|and|or|but)\b/.test(title.toLowerCase());
  details.push({
    check: 'Proper capitalization of major words',
    passed: hasProperCapitalization,
    recommendation: hasProperCapitalization ? undefined : 'Capitalize each major word (except small prepositions/articles/conjunctions)'
  });
  if (hasProperCapitalization) score++;
  
  // Check for word repetition
  const words = title.toLowerCase().split(/\s+/);
  const wordCounts = words.reduce((acc: Record<string, number>, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  
  const hasExcessiveRepetition = Object.values(wordCounts).some(count => count > 2);
  details.push({
    check: 'No excessive word repetition',
    passed: !hasExcessiveRepetition,
    recommendation: hasExcessiveRepetition ? 'Avoid repeating the same word more than twice' : undefined
  });
  if (!hasExcessiveRepetition) score++;
  
  return {
    category: '1. Title',
    passed: score >= 4,
    score,
    maxScore,
    details
  };
}

// Bullet points evaluation function
function evaluateBulletPoints(bulletPoints: string[]): EvaluationResult {
  const details = [];
  let score = 0;
  const maxScore = 5;
  
  // Check number of bullet points (should be 5)
  const hasFiveBullets = bulletPoints.length === 5;
  details.push({
    check: 'Has 5 bullet points',
    passed: hasFiveBullets,
    recommendation: hasFiveBullets ? undefined : `Currently has ${bulletPoints.length} bullet points. Amazon recommends exactly 5.`
  });
  if (hasFiveBullets) score++;
  
  // Check bullet point length (300-555 characters each)
  const validLengthBullets = bulletPoints.filter(bp => bp.length >= 300 && bp.length <= 555).length;
  const allBulletsValidLength = validLengthBullets === bulletPoints.length && bulletPoints.length > 0;
  details.push({
    check: 'Each bullet point is between 300-555 characters',
    passed: allBulletsValidLength,
    recommendation: allBulletsValidLength ? undefined : `${validLengthBullets}/${bulletPoints.length} bullet points have the correct length`
  });
  if (allBulletsValidLength) score++;
  
  // Check for proper capitalization
  const properlyCapitalizedBullets = bulletPoints.filter(bp => /^[A-Z]/.test(bp)).length;
  const allBulletsProperlyCapitalized = properlyCapitalizedBullets === bulletPoints.length && bulletPoints.length > 0;
  details.push({
    check: 'Each bullet point starts with a capital letter',
    passed: allBulletsProperlyCapitalized,
    recommendation: allBulletsProperlyCapitalized ? undefined : 'Start each bullet point with a capital letter'
  });
  if (allBulletsProperlyCapitalized) score++;
  
  // Check for ending punctuation (should not end with period)
  const noPeriodEndBullets = bulletPoints.filter(bp => !bp.trim().endsWith('.')).length;
  const allBulletsNoPeriodEnd = noPeriodEndBullets === bulletPoints.length && bulletPoints.length > 0;
  details.push({
    check: 'No bullet points end with a period',
    passed: allBulletsNoPeriodEnd,
    recommendation: allBulletsNoPeriodEnd ? undefined : 'Remove ending periods from bullet points'
  });
  if (allBulletsNoPeriodEnd) score++;
  
  // Check for promotional language
  const promotionalTerms = ['best', 'amazing', 'incredible', 'perfect', 'unbeatable', 'revolutionary', 'groundbreaking'];
  const bulletsWithPromotionalLanguage = bulletPoints.filter(bp => 
    promotionalTerms.some(term => bp.toLowerCase().includes(term))
  ).length;
  
  const noPromotionalLanguage = bulletsWithPromotionalLanguage === 0;
  details.push({
    check: 'No promotional language or subjective claims',
    passed: noPromotionalLanguage,
    recommendation: noPromotionalLanguage ? undefined : 'Remove promotional language and subjective claims'
  });
  if (noPromotionalLanguage) score++;
  
  return {
    category: '2. Bullet Points',
    passed: score >= 4,
    score,
    maxScore,
    details
  };
}

// Description evaluation function
function evaluateDescription(description: string): EvaluationResult {
  const details = [];
  let score = 0;
  const maxScore = 5;
  
  // Check if description exists
  const hasDescription = description.length > 0;
  details.push({
    check: 'Description is present',
    passed: hasDescription,
    recommendation: hasDescription ? undefined : 'Add a product description'
  });
  if (hasDescription) score++;
  
  // Check description length (max 700 characters)
  const isLengthValid = description.length <= 700;
  details.push({
    check: 'Description is within 700 characters',
    passed: isLengthValid,
    recommendation: isLengthValid ? undefined : `Current length: ${description.length} characters. Shorten to 700 or less.`
  });
  if (isLengthValid) score++;
  
  // Check for special symbols
  const hasSpecialSymbols = /[™®€†©]/.test(description);
  details.push({
    check: 'No special symbols (™, ®, €, †, ©, etc.)',
    passed: !hasSpecialSymbols,
    recommendation: hasSpecialSymbols ? 'Remove special symbols like ™, ®, €, †, ©' : undefined
  });
  if (!hasSpecialSymbols) score++;
  
  // Check for Amazon references
  const hasAmazonReferences = /\bamazon\b/i.test(description);
  details.push({
    check: 'No Amazon references',
    passed: !hasAmazonReferences,
    recommendation: hasAmazonReferences ? 'Remove references to Amazon' : undefined
  });
  if (!hasAmazonReferences) score++;
  
  // Check for superlatives
  const superlatives = ['best', 'greatest', 'perfect', 'ultimate', 'excellent', 'unforgettable'];
  const hasSuperlatives = superlatives.some(term => description.toLowerCase().includes(term));
  details.push({
    check: 'No superlatives or exaggerated claims',
    passed: !hasSuperlatives,
    recommendation: hasSuperlatives ? 'Remove superlatives like "best," "perfect," "ultimate," etc.' : undefined
  });
  if (!hasSuperlatives) score++;
  
  return {
    category: '3. Description',
    passed: score >= 4,
    score,
    maxScore,
    details
  };
}

// Images, videos and enhanced content evaluation function
function evaluateImages(imageCount: number, videoCount: number, hasEnhancedContent: boolean): EvaluationResult {
  const details = [];
  let score = 0;
  const maxScore = 3;
  
  // Check for minimum 6 images
  const hasMinimumImages = imageCount >= 6;
  details.push({
    check: 'Has at least 6 images',
    passed: hasMinimumImages,
    recommendation: hasMinimumImages ? undefined : `Currently has ${imageCount} images. Add more to meet the minimum requirement.`
  });
  if (hasMinimumImages) score++;
  
  // Check for enhanced content
  details.push({
    check: 'Has enhanced content (A+ Content)',
    passed: hasEnhancedContent,
    recommendation: hasEnhancedContent ? undefined : 'Add enhanced content (A+ Content) to improve product presentation'
  });
  if (hasEnhancedContent) score++;
  
  // Check for video
  const hasMinimumVideos = videoCount >= 1;
  details.push({
    check: 'Has at least 1 video',
    passed: hasMinimumVideos,
    recommendation: hasMinimumVideos ? undefined : 'Amazon recommends at least 1 video. Currently has none.'
  });
  if (hasMinimumVideos) score++;
  
  return {
    category: '4. Images & Videos & Enhanced Content',
    passed: score >= 2,
    score,
    maxScore,
    details
  };
}
