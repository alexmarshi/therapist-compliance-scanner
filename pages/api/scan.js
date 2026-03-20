export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, email } = req.body;

  if (!url || !email) {
    return res.status(400).json({ error: 'URL and email are required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ error: 'Could not fetch website. Check URL and try again.' });
    }

    const html = await response.text();
    const text = html.toLowerCase();

    const issues = [];
    let score = 100;

    if (!text.includes('registered associate marriage and family therapist') && 
        !text.includes('associate marriage and family therapist')) {
      issues.push({
        issue: 'Missing Full AMFT Title',
        severity: 'High',
        explanation: 'California law requires AMFTs to use their full registered title to avoid misleading clients about licensure status.',
        fix: 'Add "Registered Associate Marriage and Family Therapist" to your homepage, about page, and credentials section.'
      });
      score -= 15;
    }

    const regNumberMatch = text.match(/#\d{6}|\breg\.?\s*#?\s*\d{5,7}|registration\s*#?\s*\d{5,7}/i);
    if (!regNumberMatch) {
      issues.push({
        issue: 'Missing Registration Number',
        severity: 'High',
        explanation: 'AMFT registration numbers are required on your website to verify credentials with the state board.',
        fix: 'Include your AMFT registration number (format: #123456) on your credentials or contact page.'
      });
      score -= 15;
    }

    if (!text.includes('supervisor') && !text.includes('supervising')) {
      issues.push({
        issue: 'Missing Supervisor Disclosure',
        severity: 'High',
        explanation: 'Associates must disclose their supervising licensed therapist name and license number.',
        fix: 'Add a statement like: "Supervised by [Name], LMFT License #[Number]" on your contact or about page.'
      });
      score -= 15;
    }

    if (!text.includes('employer') && !text.includes('practice') && !text.includes('agency')) {
      issues.push({
        issue: 'Missing Employer/Practice Information',
        severity: 'Moderate',
        explanation: 'Clients should know where and for whom you work. Transparency builds trust.',
        fix: 'Clearly state your employer, practice name, or agency affiliation on your contact page.'
      });
      score -= 10;
    }

    if (text.includes('licensed therapist') && !text.includes('associate')) {
      issues.push({
        issue: 'Misleading Licensure Language',
        severity: 'High',
        explanation: 'Using "licensed therapist" without "associate" is illegal for AMFTs and misleads clients about your status.',
        fix: 'Use only "Registered Associate Marriage and Family Therapist" or "AMFT Associate" to accurately describe your licensure.'
      });
      score -= 20;
    }

    if (text.includes('guarantee') || text.includes('guaranteed results') || text.includes('guaranteed cure')) {
      issues.push({
        issue: 'Unsubstantiated Claims',
        severity: 'High',
        explanation: 'Therapy outcomes cannot be guaranteed. Making such claims violates ethical standards and state law.',
        fix: 'Remove guarantees. Replace with: "I help clients work toward their goals" or "Results vary based on individual effort."'
      });
      score -= 15;
    }

    if (!text.includes('privacy') && !text.includes('confidentiality')) {
      issues.push({
        issue: 'Missing Privacy Policy',
        severity: 'Moderate',
        explanation: 'Clients must know how their data is handled. A privacy policy is legally required.',
        fix: 'Add a privacy policy page explaining data collection, storage, and HIPAA compliance.'
      });
      score -= 10;
    }

    const hasContact = text.includes('contact') || text.includes('phone') || text.includes('email');
    if (!hasContact) {
      issues.push({
        issue: 'Incomplete Contact Information',
        severity: 'Moderate',
        explanation: 'Clients need multiple ways to reach you. Missing contact info reduces accessibility.',
        fix: 'Add phone number, email, and mailing address to your contact page.'
      });
      score -= 10;
    }

    if (text.includes('telehealth') || text.includes('online') || text.includes('virtual')) {
      if (!text.includes('california') && !text.includes('license') && !text.includes('state')) {
        issues.push({
          issue: 'Unclear Telehealth Jurisdictional Requirements',
          severity: 'Moderate',
          explanation: 'If you offer telehealth, you must clarify which states you can serve and your licensing restrictions.',
          fix: 'Add: "I provide telehealth services to California residents only" or specify your service area.'
        });
        score -= 10;
      }
    }

    let riskLevel = 'Low';
    if (score < 60) riskLevel = 'High';
    else if (score < 80) riskLevel = 'Moderate';

    score = Math.max(0, Math.min(100, score));

    res.status(200).json({
      score,
      riskLevel,
      issues,
      scanDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to scan website: ' + error.message });
  }
}