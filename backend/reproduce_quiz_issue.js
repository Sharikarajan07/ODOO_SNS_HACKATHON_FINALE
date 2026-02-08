const API_URL = 'http://localhost:5000/api';
let token = '';

async function run() {
    try {
        // 1. Login as Admin
        const email = `admin_${Date.now()}@test.com`;
        const password = 'password123';

        console.log('Registering temp admin...');
        let authRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Temp Admin',
                email,
                password,
                role: 'ADMIN'
            })
        });

        if (!authRes.ok) {
            // Try login
            console.log('Registration failed, trying login...');
            authRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        }

        if (!authRes.ok) {
            throw new Error(`Auth failed: ${authRes.statusText}`);
        }

        const authData = await authRes.json();
        token = authData.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Create Course
        console.log('Creating Course...');
        const courseRes = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Quiz Test Course ' + Date.now(),
                description: 'Testing Quizzes',
                visibility: 'PUBLIC',
                accessRule: 'FREE'
            })
        });
        const courseData = await courseRes.json();
        const courseId = courseData.id;
        console.log('Course Created:', courseId);

        // 3. Create Quiz
        console.log('Creating Quiz...');
        const quizRes = await fetch(`${API_URL}/quizzes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                courseId: courseId,
                title: 'Test Quiz',
                rewards: { attempt1: 10 }
            })
        });
        const quizData = await quizRes.json();
        const quizId = quizData.id;
        console.log('Quiz Created:', quizId);

        // 4. Add Question
        console.log('Adding Question...');
        const questionRes = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                questionText: 'Test Question 1?',
                options: [
                    { optionText: 'Option A', isCorrect: true },
                    { optionText: 'Option B', isCorrect: false }
                ]
            })
        });
        const questionData = await questionRes.json();
        console.log('Question Added:', questionData.id);

        // 5. Update Quiz (Save Settings)
        console.log('Updating Quiz Settings...');
        await fetch(`${API_URL}/quizzes/${quizId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                title: 'Updated Quiz Title',
                rewards: { attempt1: 20 }
            })
        });
        console.log('Quiz Settings Updated');

        // 6. Fetch Course again to see if Quiz and Questions are there
        console.log('Fetching Course...');
        const verifyRes = await fetch(`${API_URL}/courses/${courseId}`, { headers });
        const fetchedCourse = await verifyRes.json();

        console.log('Fetched Course Quizzes:', JSON.stringify(fetchedCourse.quizzes, null, 2));

        if (fetchedCourse.quizzes && fetchedCourse.quizzes.length > 0) {
            const q = fetchedCourse.quizzes[0];
            if (q.questions && q.questions.length > 0) {
                console.log('SUCCESS: Quiz and Questions found on Course!');
            } else {
                console.log('FAILURE: Quiz found but Questions missing!');
                // Let's check getting the quiz directly
                const quizDirectRes = await fetch(`${API_URL}/quizzes/${quizId}`, { headers });
                const quizDirect = await quizDirectRes.json();
                console.log('Direct Fetch Quiz Questions:', JSON.stringify(quizDirect.questions, null, 2));
            }
        } else {
            console.log('FAILURE: Quiz missing from Course!');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
