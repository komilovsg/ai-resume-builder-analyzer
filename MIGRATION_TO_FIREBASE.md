# 🔄 Миграция с Puter на Firebase

Подробное руководство по переводу бэкенда с Puter BaaS на Firebase.

---

## 📊 Маппинг сервисов

| Puter | Firebase | Описание |
|-------|----------|----------|
| `puter.auth` | **Firebase Authentication** | Аутентификация пользователей |
| `puter.fs` | **Firebase Storage** | Хранение файлов (PDF, изображения) |
| `puter.kv` | **Cloud Firestore** | Key-Value хранилище → NoSQL база данных |
| `puter.ai.chat()` | **OpenAI API** / **Google Gemini** / **Firebase Extensions** | AI-анализ резюме |

---

## 📦 1. Установка зависимостей

### Firebase SDK

```bash
yarn add firebase
# или
npm install firebase
```

### OpenAI (для замены Puter AI)

```bash
yarn add openai
# или
npm install openai
```

### Альтернатива: Google Gemini

```bash
yarn add @google/generative-ai
# или
npm install @google/generative-ai
```

---

## 🔧 2. Настройка Firebase проекта

### 2.1 Создание проекта в Firebase Console

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект
3. Включите следующие сервисы:
   - ✅ **Authentication** (Email/Password, Google, и т.д.)
   - ✅ **Cloud Firestore** (база данных)
   - ✅ **Storage** (файловое хранилище)

### 2.2 Получение конфигурации

В настройках проекта скопируйте конфигурацию:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2.3 Правила безопасности Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать/писать только свои данные
    match /resumes/{resumeId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### 2.4 Правила безопасности Storage

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    match /images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

---

## 💻 3. Создание Firebase Store (замена `puter.ts`)

### 3.1 Инициализация Firebase

Создайте файл `app/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 3.2 Создание Zustand Store для Firebase

Создайте файл `app/lib/firebase-store.ts`:

```typescript
import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

interface FirebaseStore {
  isLoading: boolean;
  error: string | null;
  auth: {
    user: FirebaseUser | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => FirebaseUser | null;
  };
  fs: {
    upload: (file: File, path: string) => Promise<string>; // возвращает downloadURL
    read: (path: string) => Promise<Blob>;
    delete: (path: string) => Promise<void>;
    list: (path: string) => Promise<string[]>; // возвращает список URL
  };
  kv: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list: (pattern: string) => Promise<any[]>;
  };
  init: () => void;
  clearError: () => void;
}

export const useFirebaseStore = create<FirebaseStore>((set, get) => {
  // ========== AUTH ==========
  const signIn = async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  };

  const signOut = async () => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ auth: { ...get().auth, user: null, isAuthenticated: false } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        set({
          auth: {
            ...get().auth,
            user,
            isAuthenticated: !!user,
            getUser: () => user,
          },
          isLoading: false,
        });
        resolve(!!user);
      });
    });
  };

  // ========== FILE STORAGE ==========
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const user = get().auth.user;
    if (!user) throw new Error('User not authenticated');

    const storageRef = ref(storage, `${user.uid}/${path}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const readFile = async (path: string): Promise<Blob> => {
    const url = path.startsWith('http') ? path : await getDownloadURL(ref(storage, path));
    const response = await fetch(url);
    return await response.blob();
  };

  const deleteFile = async (path: string) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  };

  const listFiles = async (path: string): Promise<string[]> => {
    const listRef = ref(storage, path);
    const res = await listAll(listRef);
    const urls = await Promise.all(
      res.items.map((item) => getDownloadURL(item))
    );
    return urls;
  };

  // ========== KEY-VALUE (Firestore) ==========
  const getKV = async (key: string) => {
    const user = get().auth.user;
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, 'resumes', key);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  };

  const setKV = async (key: string, value: any) => {
    const user = get().auth.user;
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, 'resumes', key);
    await setDoc(docRef, {
      ...value,
      userId: user.uid,
      updatedAt: new Date(),
    }, { merge: true });
  };

  const deleteKV = async (key: string) => {
    const user = get().auth.user;
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, 'resumes', key);
    await deleteDoc(docRef);
  };

  const listKV = async (pattern: string): Promise<any[]> => {
    const user = get().auth.user;
    if (!user) throw new Error('User not authenticated');

    // Firestore не поддерживает wildcard паттерны как KV
    // Нужно использовать префиксы или коллекции
    const collectionRef = collection(db, 'resumes');
    const q = query(
      collectionRef,
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      key: doc.id,
      value: doc.data(),
    }));
  };

  // ========== INIT ==========
  const init = () => {
    checkAuthStatus();
  };

  return {
    isLoading: true,
    error: null,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      upload: uploadFile,
      read: readFile,
      delete: deleteFile,
      list: listFiles,
    },
    kv: {
      get: getKV,
      set: setKV,
      delete: deleteKV,
      list: listKV,
    },
    init,
    clearError: () => set({ error: null }),
  };
});
```

---

## 🤖 4. Замена AI сервиса

### 4.1 Использование OpenAI

Создайте файл `app/lib/openai-service.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ В продакшене лучше через бэкенд
});

export async function analyzeResumeWithAI(
  imageUrl: string,
  instructions: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: instructions },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || '';
}
```

### 4.2 Альтернатива: Google Gemini

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeResumeWithGemini(
  imageBase64: string,
  instructions: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  
  const result = await model.generateContent([
    instructions,
    {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/png',
      },
    },
  ]);

  return result.response.text();
}
```

---

## 🔄 5. Изменения в коде приложения

### 5.1 Обновление `app/root.tsx`

**Было:**
```tsx
import { usePuterStore } from "./lib/puter";

export function Layout({ children }: { children: React.ReactNode }) {
  const { init } = usePuterStore();
  useEffect(() => {
    init();
  }, []);
  
  return (
    <html lang="en">
      <head>
        <script src="https://js.puter.com/v2/"></script>
      </head>
      ...
    </html>
  );
}
```

**Стало:**
```tsx
import { useFirebaseStore } from "./lib/firebase-store";

export function Layout({ children }: { children: React.ReactNode }) {
  const { init } = useFirebaseStore();
  useEffect(() => {
    init();
  }, []);
  
  return (
    <html lang="en">
      {/* Убрать скрипт Puter */}
      ...
    </html>
  );
}
```

### 5.2 Обновление `app/routes/upload.tsx`

**Было:**
```tsx
const { auth, isLoading, fs, ai, kv } = usePuterStore();

const uploadedFile = await fs.upload([file]);
const feedback = await ai.feedback(uploadedFile.path, instructions);
await kv.set(`resume:${uuid}`, JSON.stringify(data));
```

**Стало:**
```tsx
const { auth, fs, kv } = useFirebaseStore();
const user = auth.user;

// Загрузка файла
const fileUrl = await fs.upload(file, `resumes/${uuid}/resume.pdf`);
const imageUrl = await fs.upload(imageFile, `resumes/${uuid}/image.png`);

// AI анализ (через отдельный сервис)
const feedback = await analyzeResumeWithAI(imageUrl, instructions);

// Сохранение в Firestore
await kv.set(`resume:${uuid}`, {
  id: uuid,
  resumeUrl: fileUrl,
  imageUrl: imageUrl,
  companyName,
  jobTitle,
  jobDescription,
  feedback: JSON.parse(feedback),
});
```

### 5.3 Обновление `app/routes/home.tsx`

**Было:**
```tsx
const resumes = (await kv.list("resume:*", true)) as KVItem[];
resumes?.forEach((item) => {
  const parsed = JSON.parse(item.value);
  // ...
});
```

**Стало:**
```tsx
const resumes = await kv.list("resume:*");
resumes?.forEach((item) => {
  // item уже объект, не нужно парсить JSON
  const resume = item.value;
  // ...
});
```

### 5.4 Обновление `app/lib/resume-ai.ts`

**Было:**
```tsx
import { usePuterStore } from "./puter";

const { ai } = usePuterStore.getState();
const response = await ai.chat(prompt, undefined, false, {
  model: "claude-3-7-sonnet",
});
```

**Стало:**
```tsx
import { analyzeResumeWithAI } from "./openai-service";

const response = await analyzeResumeWithAI(imageUrl, prompt);
// response уже строка, не нужно парсить
```

---

## ⚠️ 6. Ключевые отличия и сложности

### 6.1 Аутентификация

| Puter | Firebase |
|-------|----------|
| `puter.auth.signIn()` — один метод | `signInWithEmailAndPassword()` или `signInWithPopup()` |
| Автоматический UI | Нужно создать свой UI |
| Простая интеграция | Требует настройки провайдеров |

### 6.2 Файловое хранилище

| Puter | Firebase |
|-------|----------|
| `fs.upload([file])` → возвращает `{path}` | `uploadBytes()` → нужен `getDownloadURL()` |
| Пути как строки | Нужны `ref()` объекты |
| Простая структура | Нужно управлять путями вручную |

### 6.3 Key-Value хранилище

| Puter | Firebase |
|-------|----------|
| `kv.set("key", "value")` — просто строка | `setDoc()` — нужен объект |
| `kv.list("pattern:*")` — wildcard поиск | Firestore не поддерживает wildcard |
| Простой API | Нужны запросы с `where()`, `orderBy()` |

**Решение для паттернов:**
```typescript
// Вместо kv.list("resume:*")
const q = query(
  collection(db, 'resumes'),
  where('userId', '==', user.uid),
  where('id', '>=', 'resume:'),
  where('id', '<', 'resume:~')
);
```

### 6.4 AI сервисы

| Puter | Firebase |
|-------|----------|
| Встроенный AI через `puter.ai` | Нужен внешний сервис (OpenAI/Gemini) |
| Работает с путями файлов | Нужны URL или base64 |
| Простая интеграция | Требует API ключи и настройку |

**⚠️ Важно:** API ключи OpenAI/Gemini не должны быть в клиентском коде! Используйте:
- Firebase Cloud Functions (рекомендуется)
- Отдельный бэкенд сервер
- Firebase Extensions для AI

---

## 🚀 7. Рекомендуемая архитектура с Firebase

### Вариант 1: Cloud Functions (рекомендуется)

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeResume = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { imageUrl, instructions } = data;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: instructions },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content || '';
});
```

**Использование в клиенте:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const analyzeResume = httpsCallable(functions, 'analyzeResume');

const result = await analyzeResume({ imageUrl, instructions });
```

### Вариант 2: Отдельный бэкенд сервер

Создайте Express/Next.js API endpoint, который будет обрабатывать AI запросы.

---

## 📝 8. Чеклист миграции

- [ ] Создать проект в Firebase Console
- [ ] Настроить Authentication (Email/Password, Google)
- [ ] Настроить Firestore с правилами безопасности
- [ ] Настроить Storage с правилами безопасности
- [ ] Установить Firebase SDK
- [ ] Создать `firebase.ts` с конфигурацией
- [ ] Создать `firebase-store.ts` (замена `puter.ts`)
- [ ] Настроить AI сервис (OpenAI/Gemini) или Cloud Functions
- [ ] Обновить `root.tsx` (убрать Puter скрипт)
- [ ] Обновить все компоненты, использующие `usePuterStore` → `useFirebaseStore`
- [ ] Обновить логику работы с файлами (пути → URL)
- [ ] Обновить логику работы с KV (строки → объекты)
- [ ] Обновить AI вызовы
- [ ] Протестировать аутентификацию
- [ ] Протестировать загрузку файлов
- [ ] Протестировать сохранение данных
- [ ] Протестировать AI анализ
- [ ] Настроить переменные окружения (`.env`)
- [ ] Обновить документацию

---

## 🔐 9. Переменные окружения

Создайте `.env` файл:

```env
# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# OpenAI (или Gemini)
VITE_OPENAI_API_KEY=your-openai-key
# или
VITE_GEMINI_API_KEY=your-gemini-key
```

**⚠️ Важно:** В продакшене API ключи AI должны быть на сервере, а не в клиенте!

---

## 💰 10. Стоимость

### Firebase (примерно)
- **Authentication**: Бесплатно до 50K MAU
- **Firestore**: Бесплатно до 1GB хранения, 50K чтений/день
- **Storage**: Бесплатно до 5GB, 1GB трафика/день

### OpenAI
- **GPT-4 Vision**: ~$0.01-0.03 за запрос (зависит от размера изображения)

### Puter
- Зависит от тарифного плана Puter

---

## 🎯 Итоги

**Преимущества Firebase:**
- ✅ Более зрелая и стабильная платформа
- ✅ Лучшая документация и сообщество
- ✅ Больше возможностей кастомизации
- ✅ Лучшая интеграция с другими сервисами Google

**Недостатки миграции:**
- ❌ Нужно переписать весь бэкенд код
- ❌ Нет встроенного AI (нужен внешний сервис)
- ❌ Более сложная настройка
- ❌ Нужно управлять правилами безопасности

**Рекомендация:** Если проект уже работает на Puter и удовлетворяет потребности, миграция может быть не обязательной. Но если нужен больший контроль, масштабируемость или интеграция с другими сервисами — Firebase хороший выбор.

