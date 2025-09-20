import { getFirestore, auth } from "./firebase" // Adjust this path as needed
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import type { User } from "firebase/auth"

export interface ChatMessage {
  id: string
  userId: string
  role: "user" | "assistant"
  content: string
  timestamp: any
  agentId?: string
  fileExtractedText?: string // Store only extracted text from files, not the files themselves
}

export class FirestoreService {
  private db: ReturnType<typeof getFirestore> | null = null

  private async ensureDb() {
    if (!this.db) {
      this.db = await getFirestore()
    }
    return this.db
  }

  private getCurrentUser(): User | null {
    const u = auth.currentUser
    return u
  }

  async saveChatMessage(
    role: "user" | "assistant",
    content: string,
    agentId?: string,
    fileExtractedText?: string,
  ): Promise<string | null> {
    try {
      // Ensure user is authenticated
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        console.log("[FirestoreService] Cannot save message: user not authenticated")
        return null
      }
      const userId = currentUser.uid

      await this.ensureDb()
      const messagesRef = collection(this.db!, "chat_messages")

      const messageData: Omit<ChatMessage, "id"> = {
        userId,
        role,
        content,
        timestamp: serverTimestamp(),
      }

      if (agentId) {
        messageData.agentId = agentId
      }
      if (fileExtractedText) {
        messageData.fileExtractedText = fileExtractedText
      }

      const docRef = await addDoc(messagesRef, messageData)
      console.log("[FirestoreService] Chat message saved:", docRef.id)
      return docRef.id
    } catch (error) {
      console.log("[FirestoreService] Failed to save chat message:", error)
      return null
    }
  }

  async getChatHistoryByAgent(agentId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        console.log("[FirestoreService] Cannot fetch history: user not authenticated")
        return []
      }
      const userId = currentUser.uid

      await this.ensureDb()
      const messagesRef = collection(this.db!, "chat_messages")
      const q = query(messagesRef, where("userId", "==", userId))

      const querySnapshot = await getDocs(q)
      const messages: ChatMessage[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.agentId === agentId) {
          messages.push({
            id: doc.id,
            userId: data.userId,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp,
            agentId: data.agentId,
            fileExtractedText: data.fileExtractedText,
          })
        }
      })

      messages.sort((a, b) => {
        const aTime = a.timestamp?.toMillis?.() || 0
        const bTime = b.timestamp?.toMillis?.() || 0
        return aTime - bTime // chronological order
      })

      return messages.slice(-limit) // get last N messages
    } catch (error) {
      console.log("[FirestoreService] Error fetching chat history:", error)
      return []
    }
  }

  async getChatHistory(limit = 50): Promise<ChatMessage[]> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        console.log("[FirestoreService] Cannot fetch history: user not authenticated")
        return []
      }
      const userId = currentUser.uid

      await this.ensureDb()
      const messagesRef = collection(this.db!, "chat_messages")
      const q = query(messagesRef, where("userId", "==", userId))

      const querySnapshot = await getDocs(q)
      const messages: ChatMessage[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        messages.push({
          id: doc.id,
          userId: data.userId,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp,
          agentId: data.agentId,
          fileExtractedText: data.fileExtractedText,
        })
      })

      messages.sort((a, b) => {
        const aTime = a.timestamp?.toMillis?.() || 0
        const bTime = b.timestamp?.toMillis?.() || 0
        return aTime - bTime // chronological order
      })

      return messages.slice(-limit) // get last N messages
    } catch (error) {
      console.log("[FirestoreService] Error fetching chat history:", error)
      return []
    }
  }
}

export const firestoreService = new FirestoreService()
