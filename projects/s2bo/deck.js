// Source: projects/s2bo/SCRIPT.md
export default {
  title: 'Straight2Bank Onboarding',
  music: 'music.mp3', // optional, from assets/s2bo/
  slides: [
    {
      layout: 'title',
      kicker: 'Introducing S2BO',
      heading: 'Straight2Bank Onboarding',
      media: { kind: 'photo', src: 'hero-weave.jpg', label: 'Detail of a woven architectural facade' },
      items: [{ text: 'A new chapter in client onboarding.' }, { text: 'Launching in Singapore - 16 November 2026' }],
    },
    {
      layout: 'content',
      heading: 'A clearer journey.',
      marker: 'none',
      media: [
        { kind: 'screenshot', src: 'screen-assist.png', label: 'S2BO Assist: bank team workspace' },
        { kind: 'screenshot', src: 'screen-overview.png', label: 'S2BO client home: application overview' },
      ],
      items: [{ text: 'Clear steps.' }, { text: 'Visible progress.' }, { text: 'Clients and bank teams, connected.' }],
    },
    {
      layout: 'content',
      heading: 'Singapore first.',
      marker: 'none',
      media: { kind: 'photo', src: 'singapore.jpg', label: 'Aerial view of the Fountain of Wealth, Singapore' },
      items: [{ text: 'For New-to-Bank clients.' }, { text: 'Conventional and Saadiq CASA account opening.' }],
    },
    {
      layout: 'content',
      heading: 'Two workspaces. One journey.',
      groups: [
        {
          heading: 'Bank teams',
          variant: 'plain',
          media: { kind: 'screenshot', src: 'screen-assist.png', label: 'S2BO Assist: bank team workspace' },
          items: [{ text: 'S2BO Assist', note: 'Bank teams initiate, guide and review.' }],
        },
        {
          heading: 'Clients',
          variant: 'plain',
          media: { kind: 'screenshot', src: 'screen-client.png', label: 'S2BO: client workspace' },
          items: [{ text: 'S2BO', note: 'Clients complete, submit and sign.' }],
        },
      ],
    },
    {
      layout: 'content',
      heading: 'From invitation to submission.',
      items: [
        {
          text: 'Open your invitation.',
          media: { kind: 'screenshot', src: 'screen-invitation.png', label: 'Invitation email with the S2BO link' },
        },
        {
          text: 'Complete your application.',
          media: { kind: 'screenshot', src: 'screen-application.png', label: 'Application form in progress' },
        },
        {
          text: 'Upload documents. Review. Submit.',
          media: { kind: 'screenshot', src: 'screen-submit.png', label: 'Document upload and review before submit' },
        },
      ],
    },
    {
      layout: 'content',
      heading: 'See where you stand.',
      marker: 'none',
      items: [
        { text: 'Track completion.' },
        { text: "See what's outstanding." },
        { text: 'Follow your application through review, signing and approval.' },
      ],
      aside: {
        heading: 'The journey',
        variant: 'steps',
        items: [
          { text: 'Client draft' },
          { text: 'Bank review' },
          { text: 'Client signing' },
          { text: 'Under processing' },
          { text: 'Approved' },
        ],
        note: 'Approval and account activation are separate. This journey does not imply instant activation.',
      },
    },
    {
      layout: 'content',
      heading: 'Ready to sign.',
      marker: 'none',
      items: [
        { text: 'Prefilled application documents.' },
        {
          text: 'Docusign where eligible.',
          tag: 'Eligibility applies',
          note: 'Electronic signing is available only where eligible.',
        },
        {
          text: 'Wet signing where required.',
          note: 'Follow the applicable signing requirements for the application.',
        },
      ],
    },
    {
      layout: 'content',
      heading: 'Get launch-ready.',
      items: [{ text: 'Confirm your access.' }, { text: 'Know your role.' }, { text: 'Explore the user guides.' }],
      aside: {
        heading: 'Before launch',
        variant: 'checks',
        items: [{ text: 'Access permissions' }, { text: 'Workspace responsibilities' }, { text: 'Guide familiarisation' }],
      },
    },
    {
      layout: 'title',
      heading: 'Straight2Bank Onboarding',
      media: { kind: 'photo', src: 'hero-architecture.jpg', label: 'Curved architectural facade against the sky' },
      items: [{ text: 'Clearer steps. Connected participation.' }, { text: 'Singapore - 16 November 2026' }],
    },
  ],
}
