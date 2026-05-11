import { useEffect, useReducer, useRef, useState } from "react";
import { Select, Input, TextArea } from "@/shared/ui";
import CrossIcon from "@assets/icons/cross.svg";
import PaperClipIcon from "@assets/icons/paperclip.svg";
import UploadIcon from "@assets/icons/upload.svg";
import styles from "./FeedbackForm.module.css";
import { FEEDBACK_REASONS, CHANELLS } from "./lib/consts/consts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/avif", "image/webp", "image/jpg"];
const MAX_SIZE_MB = 5;
const MAX_FILES = 5;

const validateContact = (value: string, channel?: string): string => {
  if (!value || !channel) return "";
  if (channel === CHANELLS[0]) {
    if (value.includes("@")) return "Ник не должен содержать символ @";
  } else {
    if (!EMAIL_REGEX.test(value)) return "Введите корректный email";
  }
  return "";
};

const validators: Partial<Record<keyof FormState, (value: string, channel?: string) => string>> = {
  contact: validateContact,
  message: (value: string) => (value ? "" : "Введите сообщение"),
};

interface FileEntry {
  file: File;
  invalid: boolean;
  errorReason?: string;
}

interface FormState {
  reason: string;
  channel: string;
  contact: string;
  message: string;
  files: FileEntry[];
  errorsState: {
    contact: string;
    message: string;
    files: string;
  };
}

type FormAction =
  | { type: "SET_VALUE"; payload: { fieldName: keyof FormState; value: string } }
  | { type: "SET_ERROR"; payload: { fieldName: keyof FormState; value: string } }
  | { type: "ADD_FILES"; payload: { files: FileList | File[] } }
  | { type: "REMOVE_FILE"; payload: { name: string } }
  | { type: "CLEAR_ERROR"; payload: { fieldName: keyof FormState } }
  | { type: "RESET" };

const initialState: FormState = {
  reason: FEEDBACK_REASONS[0],
  channel: CHANELLS[0],
  contact: "",
  message: "",
  files: [],
  errorsState: {
    contact: "",
    message: "",
    files: "",
  },
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_VALUE":
      return {
        ...state,
        [action.payload.fieldName]: action.payload.value,
        errorsState: {
          ...state.errorsState,
          [action.payload.fieldName]:
            action.payload.fieldName in validators
              ? validators[action.payload.fieldName]?.(action.payload.value, state.channel)
              : "",
        },
      };
    case "SET_ERROR":
      return { ...state, errorsState: { ...state.errorsState, [action.payload.fieldName]: action.payload.value } };
    case "CLEAR_ERROR":
      return { ...state, errorsState: { ...state.errorsState, [action.payload.fieldName]: "" } };
    case "ADD_FILES": {
      const prev = state.files;
      const arrNewFiles = Array.from(action.payload.files);
      const names = new Set(prev.map(e => e.file.name));
      let error = "";
      const newEntries = arrNewFiles
        .filter(f => !names.has(f.name))
        .map(f => {
          const wrongType = !ALLOWED_TYPES.includes(f.type);
          const tooBig = f.size > MAX_SIZE_MB * 1024 * 1024;
          const invalid = wrongType || tooBig;
          const errorReason = wrongType ? "Недопустимый формат" : tooBig ? `Превышает ${MAX_SIZE_MB} МБ` : undefined;
          error = errorReason || error;
          return { file: f, invalid, errorReason };
        });

      if (prev.length + newEntries.length > MAX_FILES) {
        error = `Можно загрузить до ${MAX_FILES} файлов`;
      }

      return {
        ...state,
        files: [...prev, ...newEntries],
        errorsState: { ...state.errorsState, files: state.errorsState.files || error },
      };
    }
    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter(e => e.file.name !== action.payload.name),
        errorsState: {
          ...state.errorsState,
          files: state.files.length <= MAX_FILES + 1 ? "" : `Можно загрузить до ${MAX_FILES} файлов`,
        },
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

export const FeedbackForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [activeDrag, setActiveDrag] = useState(false);
  const { reason, channel, contact, message, files, errorsState } = state;
  const formRef = useRef<HTMLFormElement>(null);
  const dragCounterRef = useRef(0);

  const handleChannelChange = (newChannel: string) => {
    dispatch({
      type: "SET_VALUE",
      payload: {
        fieldName: "channel",
        value: newChannel,
      },
    });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "SET_VALUE",
      payload: {
        fieldName: "contact",
        value: e.target.value,
      },
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log("e.target.files");
      dispatch({
        type: "ADD_FILES",
        payload: {
          files: Array.from(e.target.files),
        },
      });
    }
    e.target.value = "";
  };

  const handleRemoveFile = (name: string) => {
    dispatch({
      type: "REMOVE_FILE",
      payload: {
        name,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("channel", channel);
    formData.append("contact", contact);
    formData.append("message", message);
    files.filter(e => !e.invalid).forEach(e => formData.append("files", e.file));
    console.log({ reason, channel, contact, message, files: files });

    dispatch({ type: "RESET" });
    // fetch('/api/feedback', { method: 'POST', body: formData });
  };

  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) {
        setActiveDrag(true);
        dispatch({
          type: "CLEAR_ERROR",
          payload: {
            fieldName: "files",
          },
        });
      }
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) {
        setActiveDrag(false);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setActiveDrag(false);
      if (e.dataTransfer?.files) {
        dispatch({
          type: "ADD_FILES",
          payload: {
            files: e.dataTransfer.files,
          },
        });
      }
    };

    formEl.addEventListener("dragenter", handleDragEnter);
    formEl.addEventListener("dragleave", handleDragLeave);
    formEl.addEventListener("dragover", handleDragOver);
    formEl.addEventListener("drop", handleDrop);

    return () => {
      formEl.removeEventListener("dragenter", handleDragEnter);
      formEl.removeEventListener("dragleave", handleDragLeave);
      formEl.removeEventListener("dragover", handleDragOver);
      formEl.removeEventListener("drop", handleDrop);
    };
  }, []);

  const hasInvalidFiles = files.some(e => e.invalid);
  const submitButtonDisabled =
    Boolean(errorsState.contact) ||
    Boolean(errorsState.message) ||
    !contact.trim() ||
    !message.trim() ||
    hasInvalidFiles;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.FeedbackForm}>
      <div className={styles.FeedbackForm__FormWrapper}>
        <h2>Форма обратной связи</h2>

        {activeDrag ? (
          <div className={styles.FeedbackForm__DragOverlay}>
            <UploadIcon />
            <div>
              <span>Загрузите файлы до 5 Мб</span>
              <span className={styles.FeedbackForm__FileUploadExts}>Подходят .jpg, .jpeg, .png, .webp, .avif</span>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.FeedbackForm__SelectsWrapper}>
              <Select
                label='Тип обращения'
                name='reason-field'
                initialValue={FEEDBACK_REASONS[0]}
                options={FEEDBACK_REASONS}
                onChange={value =>
                  dispatch({
                    type: "SET_VALUE",
                    payload: {
                      fieldName: "reason",
                      value: value,
                    },
                  })
                }
                className={styles.FeedbackForm__Select}
              />
              <div className={styles.FeedbackForm__InputChanelWrapper}>
                <Input
                  placeholder={channel === CHANELLS[0] ? "Ваш ник без @" : "your@email.com"}
                  label='Контакт для связи'
                  name='text-field'
                  className={styles.FeedbackForm__Input}
                  value={contact}
                  onChange={handleContactChange}
                  onBlur={() => {
                    dispatch({
                      type: "CLEAR_ERROR",
                      payload: {
                        fieldName: "contact",
                      },
                    });
                  }}
                  error={errorsState.contact}
                />
                <Select
                  initialValue={CHANELLS[0]}
                  label=''
                  name='channel-field'
                  options={CHANELLS}
                  className={styles.FeedbackForm__SelectChannel}
                  sizeArrow={8}
                  onChange={handleChannelChange}
                />
              </div>
            </div>
            <div className={styles.FeedbackForm__TextAreaWrapper}>
              <TextArea
                label='Сообщение'
                name='message-field'
                className={styles.FeedbackForm__TextArea}
                error={errorsState.message}
                placeholder='Здесь можно написать обращение и прикрепить фото'
                value={message}
                onChange={e =>
                  dispatch({ type: "SET_VALUE", payload: { fieldName: "message", value: e.target.value } })
                }
                onBlur={() => {
                  dispatch({
                    type: "CLEAR_ERROR",
                    payload: {
                      fieldName: "message",
                    },
                  });
                }}
              />
              {files.length === 0 && (
                <div className={styles.FeedbackForm__PaperClipUploader}>
                  <input
                    type='file'
                    id='paper-uploader'
                    className={styles.FeedbackForm__FileInput}
                    accept={ALLOWED_TYPES.join(",")}
                    multiple
                    onChange={handleFileInputChange}
                  />
                  <label htmlFor='paper-uploader'>
                    <PaperClipIcon />
                  </label>
                </div>
              )}
            </div>
            {files.length > 0 && (
              <div className={styles.FeedbackForm__FilesPreview}>
                {files.map(({ file, invalid, errorReason }) => (
                  <div
                    key={file.name}
                    className={`${styles.FeedbackForm__FileItem} ${invalid ? styles.FeedbackForm__FileItem_invalid : ""}`}
                    title={invalid ? errorReason : file.name}
                  >
                    <img src={URL.createObjectURL(file)} alt={file.name} className={styles.FeedbackForm__FileThumb} />
                    <button
                      type='button'
                      className={styles.FeedbackForm__FileRemove}
                      onClick={() => handleRemoveFile(file.name)}
                      aria-label='Удалить файл'
                    >
                      <CrossIcon />
                    </button>
                  </div>
                ))}
                {files.length < MAX_FILES && (
                  <div className={`${styles.FeedbackForm__FileItem} ${styles.FeedbackForm__FileAdd}`}>
                    <input
                      type='file'
                      id='add-more-uploader'
                      className={styles.FeedbackForm__FileInput}
                      accept={ALLOWED_TYPES.join(",")}
                      multiple
                      onChange={handleFileInputChange}
                    />
                    <label htmlFor='add-more-uploader'>
                      <CrossIcon />
                    </label>
                  </div>
                )}
              </div>
            )}
            {errorsState.files && <div className={styles.FeedbackForm__Error}>{errorsState.files}</div>}
          </>
        )}
      </div>

      <button className='baseButton mainButton' disabled={submitButtonDisabled}>
        Отправить сообщение
      </button>
    </form>
  );
};
