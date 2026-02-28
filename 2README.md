Project SkillAI Documentation
========================================================================================================================================

Technical Architecture:
------------------------------
The SkillPath AI is structured into three main components that connect seamlessly. The front-end, built with Flutter, delivers a cross-platform user interface where learners access courses, career tests, and resume analysis. The backend services, deployed on Cloud Run, handle AI-powered features such as resume scanning, skill recommendations, and career path matching. These services connect to Firebase, which manages authentication, real-time databases, and analytics to track user progress. This architecture was chosen to ensure scalability, fast performance, and easy integration: Flutter provides a unified experience across devices, Cloud Run allows flexible AI deployment, and Firebase keeps data secure and synchronised. Together, these components create a reliable system that adapts to user needs while remaining efficient to maintain.


Implementation:
------------------------------
We built the SkillPath AI Website using a stack of Google Developer Technologies chosen for scalability, speed, and ease of integration. Firebase was used for authentication, real-time database, and analytics because it provides a seamless backend solution without heavy server management. Cloud Run was selected to deploy AI-powered resume analysis and career testing services, offering automatic scaling and containerised flexibility compared to traditional hosting. Flutter was chosen for the front-end because it allows us to deliver a single, high-performance app across Android, iOS, and web with a consistent UI. Together, these tools gave us a fast, reliable, and cross-platform solution that alternatives couldn’t match in terms of integration and developer efficiency.

Innovation:
------------------------------
The SkillPath AI Website stands out because it combines learning, resume analysis, and career guidance in one platform. Unlike existing alternatives that focus only on courses or only on job matching, our solution integrates both: users learn practical skills, get their resumes analysed, and receive tailored job recommendations in a single flow. AI makes this process adaptive—lessons adjust to progress, and career tests provide data-driven results. This holistic approach ensures users don’t just learn, but also understand how those skills directly strengthen their career path, making the app both practical and impactful.

Challenges:
------------------------------
One major challenge was integrating the AI-powered resume analysis with Firebase’s real-time database. Initially, the system struggled to process resumes quickly because the AI service and database weren’t syncing efficiently, causing delays in generating job recommendations. To debug, we traced the bottleneck by logging each step of the data flow—upload, AI processing, and database write. We discovered that the AI service was returning results in a format that required extra conversion before Firebase could store them, slowing everything down. The solution was to restructure the API response into a standardised JSON format and implement asynchronous writes to Firebase. As a result, resume analysis became faster and smoother, reducing processing time from several seconds to under one second, and greatly improving the user experience.

Future Roadmap:
------------------------------
SkillPath AI Website can expand from individual users to partnerships with universities, training centres, and employers, creating a full ecosystem for career development. With AI-driven personalisation, the app could scale to millions of users globally, offering localised skill paths for different industries and regions. It also has the potential to integrate directly with recruitment platforms, making resumes and skill upgrades instantly visible to employers. This growth would transform the app from a learning tool into a career-launching platform with wide impact.

