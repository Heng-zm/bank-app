(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/hooks/use-toast.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "reducer": (()=>reducer),
    "toast": (()=>toast),
    "useToast": (()=>useToast)
});
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(memoryState);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useToast.useEffect": ()=>{
            listeners.push(setState);
            return ({
                "useToast.useEffect": ()=>{
                    const index = listeners.indexOf(setState);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            })["useToast.useEffect"];
        }
    }["useToast.useEffect"], [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
_s(useToast, "SPWE98mLGnlsnNfIwu/IAKTSZtk=");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": (()=>cn)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/toast.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Toast": (()=>Toast),
    "ToastAction": (()=>ToastAction),
    "ToastClose": (()=>ToastClose),
    "ToastDescription": (()=>ToastDescription),
    "ToastProvider": (()=>ToastProvider),
    "ToastTitle": (()=>ToastTitle),
    "ToastViewport": (()=>ToastViewport)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-toast/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
const ToastProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"];
const ToastViewport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, this));
_c1 = ToastViewport;
ToastViewport.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"].displayName;
const toastVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
    variants: {
        variant: {
            default: "border-border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
const Toast = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c2 = ({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(toastVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
});
_c3 = Toast;
Toast.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
const ToastAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 63,
        columnNumber: 3
    }, this));
_c5 = ToastAction;
ToastAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Action"].displayName;
const ToastClose = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className),
        "toast-close": "",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/toast.tsx",
            lineNumber: 87,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 78,
        columnNumber: 3
    }, this));
_c7 = ToastClose;
ToastClose.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"].displayName;
const ToastTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 96,
        columnNumber: 3
    }, this));
_c9 = ToastTitle;
ToastTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const ToastDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm opacity-90", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 108,
        columnNumber: 3
    }, this));
_c11 = ToastDescription;
ToastDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "ToastViewport$React.forwardRef");
__turbopack_context__.k.register(_c1, "ToastViewport");
__turbopack_context__.k.register(_c2, "Toast$React.forwardRef");
__turbopack_context__.k.register(_c3, "Toast");
__turbopack_context__.k.register(_c4, "ToastAction$React.forwardRef");
__turbopack_context__.k.register(_c5, "ToastAction");
__turbopack_context__.k.register(_c6, "ToastClose$React.forwardRef");
__turbopack_context__.k.register(_c7, "ToastClose");
__turbopack_context__.k.register(_c8, "ToastTitle$React.forwardRef");
__turbopack_context__.k.register(_c9, "ToastTitle");
__turbopack_context__.k.register(_c10, "ToastDescription$React.forwardRef");
__turbopack_context__.k.register(_c11, "ToastDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/toaster.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Toaster": (()=>Toaster)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/toast.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Toaster() {
    _s();
    const { toasts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
        children: [
            toasts.map(function({ id, title, description, action, ...props }) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toast"], {
                    ...props,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-1",
                            children: [
                                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastTitle"], {
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 22,
                                    columnNumber: 25
                                }, this),
                                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastDescription"], {
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 24,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 21,
                            columnNumber: 13
                        }, this),
                        action,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastClose"], {}, void 0, false, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this)
                    ]
                }, id, true, {
                    fileName: "[project]/src/components/ui/toaster.tsx",
                    lineNumber: 20,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastViewport"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/toaster.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/toaster.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(Toaster, "1YTCnXrq2qRowe0H/LBWLjtXoYc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = Toaster;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/firebase.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "app": (()=>app),
    "auth": (()=>auth),
    "db": (()=>db),
    "storage": (()=>storage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$8e6e89cb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__getAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/esm2017/index-8e6e89cb.js [app-client] (ecmascript) <export p as getAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/storage/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/index.esm2017.js [app-client] (ecmascript)");
;
;
;
;
const firebaseConfig = {
    apiKey: "AIzaSyBU_Q2F0zIMTrIyh5nXERtU3fEtlSX4SH0",
    authDomain: "mystical-slate-448113-c6.firebaseapp.com",
    projectId: "mystical-slate-448113-c6",
    storageBucket: "mystical-slate-448113-c6.appspot.com",
    messagingSenderId: "681914071632",
    appId: "1:681914071632:web:35d31b8d1dafb51d51ef55",
    measurementId: "G-HQSH8R6RF9"
};
// Check if all required environment variables are present
const firebaseConfigValues = Object.values(firebaseConfig);
const areConfigValuesPresent = firebaseConfigValues.every((value)=>value);
let app;
let auth;
let db;
let storage;
if (areConfigValuesPresent) {
    app = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApps"])().length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApp"])();
    auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$8e6e89cb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__getAuth$3e$__["getAuth"])(app);
    db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestore"])(app);
    storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStorage"])(app);
} else {
    console.warn("Firebase config is missing. Please check your .env file.");
    // Provide dummy instances if config is not set
    app = undefined;
    auth = undefined;
    db = undefined;
    storage = undefined;
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/use-auth.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$8e6e89cb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__z__as__onAuthStateChanged$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/esm2017/index-8e6e89cb.js [app-client] (ecmascript) <export z as onAuthStateChanged>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    isLoading: true
});
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]) {
                setIsLoading(false);
                // On the server, we can't determine auth state, so we'll just render children.
                // The client-side effect will handle redirection if necessary.
                if ("TURBOPACK compile-time falsy", 0) {
                    "TURBOPACK unreachable";
                }
            }
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$8e6e89cb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__z__as__onAuthStateChanged$3e$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], {
                "AuthProvider.useEffect.unsubscribe": (user)=>{
                    setUser(user);
                    setIsLoading(false);
                }
            }["AuthProvider.useEffect.unsubscribe"]);
            return ({
                "AuthProvider.useEffect": ()=>unsubscribe()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (isLoading || "object" === 'undefined') return;
            const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
            if (!user && !isAuthPage) {
                router.push('/login');
            }
            if (user && isAuthPage) {
                router.push('/');
            }
        }
    }["AuthProvider.useEffect"], [
        user,
        isLoading,
        pathname,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/hooks/use-auth.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
};
_s(AuthProvider, "SWJuhWhWQgul5IsZEWEhril+390=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
};
_s1(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/use-local-storage.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useLocalStorage": (()=>useLocalStorage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function parseJSON(value) {
    try {
        return value === 'undefined' ? undefined : JSON.parse(value ?? '');
    } catch  {
        console.log('parsing error on', {
            value
        });
        return undefined;
    }
}
function useLocalStorage(key, initialValue) {
    _s();
    const readValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLocalStorage.useCallback[readValue]": ()=>{
            // Prevent build errors "window is not defined" but keep keep working
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            try {
                const item = window.localStorage.getItem(key);
                return item ? parseJSON(item) : initialValue;
            } catch (error) {
                console.warn(`Error reading localStorage key “${key}”:`, error);
                return initialValue;
            }
        }
    }["useLocalStorage.useCallback[readValue]"], [
        initialValue,
        key
    ]);
    const [storedValue, setStoredValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValue);
    const setValue = (value)=>{
        // Prevent build errors "window is not defined" but keep keep working
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if ("TURBOPACK compile-time truthy", 1) {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLocalStorage.useEffect": ()=>{
            setStoredValue(readValue());
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useLocalStorage.useEffect"], []);
    return [
        storedValue,
        setValue
    ];
}
_s(useLocalStorage, "c59n/uGxrpUUK6SKZ/nfCYrJd0M=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lang/en.json (json)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v(JSON.parse("{\"logout\":\"Logout\",\"error\":\"Error\",\"success\":\"Success\",\"cancel\":\"Cancel\",\"reset\":\"Reset\",\"share\":\"Share\",\"amount\":\"Amount\",\"recipient\":\"Recipient\",\"pending\":\"Pending\",\"searching\":\"Searching\",\"firebase\":{\"notConfigured\":\"Firebase is not configured. Please check your environment variables.\"},\"nav\":{\"dashboard\":\"Home\",\"settings\":\"Settings\"},\"account\":{\"copied\":\"Copied!\",\"copiedDescription\":\"Account number copied to clipboard.\",\"accountNumber\":\"Account Number\",\"availableBalance\":\"Available Balance\",\"checkingBalance\":\"Checking Account Balance\",\"account\":\"Acct\"},\"dashboard\":{\"greeting\":\"Hi, {{name}}\",\"welcomeMessage\":\"What do you want to do today?\",\"spending\":{\"title\":\"Spending Summary\",\"description\":\"A breakdown of your spending by category.\",\"noData\":\"No spending data to display.\",\"general\":\"General\",\"transfers\":\"Transfers\",\"dining\":\"Dining\",\"groceries\":\"Groceries\",\"transport\":\"Transport\"},\"history\":{\"title\":\"Recent Transactions\",\"viewAll\":\"View All\"},\"myQr\":{\"title\":\"My QR Code\",\"description\":\"Display your QR to receive money.\"},\"scanQr\":{\"title\":\"Scan to Pay\",\"description\":\"Pay by scanning a QR code.\"},\"historyCard\":{\"title\":\"Transaction History\",\"description\":\"View all your past transactions.\"}},\"transactionForm\":{\"title\":\"New Transaction\",\"description\":\"Send money using a 9-digit account number.\",\"recipientLabel\":\"Recipient Account #\",\"recipientPlaceholder\":\"e.g., 001-002-003\",\"recipientNotFound\":\"Account not found\",\"errorFindingAccount\":\"Error finding account\",\"descriptionLabel\":\"Description\",\"descriptionPlaceholder\":\"e.g., Dinner with friends\",\"submitButton\":\"Submit Transaction\"},\"transactions\":{\"title\":\"Full Transaction History\",\"description\":\"A record of all your account activity.\",\"recentDescription\":\"Your {{count}} most recent transactions.\",\"noTransactions\":\"No transactions found.\",\"pending\":\"Pending\",\"filter\":{\"typePlaceholder\":\"Filter by type\",\"allTypes\":\"All Types\",\"deposit\":\"Deposit\",\"withdrawal\":\"Withdrawal\",\"datePlaceholder\":\"Pick a date range\",\"resetTitle\":\"Reset filters\"},\"table\":{\"description\":\"Description\",\"date\":\"Date\",\"type\":\"Type\",\"amount\":\"Amount\"},\"types\":{\"deposit\":\"Deposit\",\"withdrawal\":\"Withdrawal\"}},\"quickpay\":{\"title\":\"Quick Pay\",\"description\":\"Send money to your frequent contacts.\",\"noRecipients\":\"Once you make a few transactions, your frequent contacts will appear here.\",\"dialog\":{\"title\":\"Pay {{name}}\",\"description\":\"Confirm the details to send your payment quickly.\",\"sendButton\":\"Send Payment\"}},\"qrpay\":{\"title\":\"Scan to Pay\",\"cameraError\":\"Camera access is required. Please enable camera permissions in your browser settings.\",\"invalidQrFormat\":\"Invalid QR code format. Expected a recipient.\",\"qrParseError\":\"Failed to parse QR code data. Please use a valid payment QR code.\",\"flashError\":{\"title\":\"Flashlight Error\",\"description\":\"Could not toggle the flashlight.\"},\"import\":{\"failTitle\":\"Scan Failed\",\"failDescription\":\"No QR code could be found in the selected image.\",\"buttonTitle\":\"Import QR Code from image\"},\"paymentSuccess\":{\"title\":\"Payment Successful\",\"description\":\"You paid {{amount}} to {{recipient}}.\"},\"paymentError\":{\"unexpected\":\"An unexpected error occurred during payment.\"},\"analysisError\":{\"title\":\"Could not analyze transaction\",\"description\":\"Proceeding with payment, but please be cautious.\"},\"confirmPaymentButton\":\"Confirm Payment\",\"status\":{\"completed\":\"Payment was completed successfully.\",\"confirmDetails\":\"Confirm your payment details.\",\"positionQr\":\"Position a QR code inside the frame.\"},\"cameraDenied\":\"Camera access denied. Please enable it in your browser settings.\",\"flashButtonTitle\":\"Toggle flashlight\",\"paymentComplete\":{\"title\":\"Payment Complete!\",\"description\":\"You successfully paid ${{amount}} to {{recipient}}.\"},\"scanAnotherButton\":\"Scan Another Code\",\"paymentDetails\":\"Payment Details\",\"setAmountButton\":\"Set Amount\"},\"myqr\":{\"title\":\"Receive Payment\",\"description\":\"Share this QR code to get paid. You can add an amount below.\",\"requesting\":\"Requesting\",\"requestingPayment\":\"Requesting payment\",\"to\":\"To\",\"scanToPay\":\"Scan to pay {{name}}\",\"share\":{\"withAmount\":\"Here is my payment QR code to receive ${{amount}} from {{name}}.\",\"withoutAmount\":\"Here is my payment QR code to receive money from {{name}}.\",\"title\":\"FinSim Payment Request\",\"errorTitle\":\"Share Failed\",\"errorDescription\":\"Could not share the QR code.\",\"notSupportedTitle\":\"Share Not Supported\",\"notSupportedDescription\":\"Your browser does not support the Web Share API.\"},\"save\":{\"button\":\"Save QR Code\",\"errorTitle\":\"Save Failed\",\"errorNotReady\":\"QR code data is not ready.\",\"errorNoCanvas\":\"Could not find the QR code canvas to save.\",\"errorCreateImage\":\"Could not create image.\",\"successTitle\":\"QR Code Saved\",\"successDescription\":\"Your custom QR code has been downloaded.\"},\"form\":{\"amountLabel\":\"Specific Amount (Optional)\",\"setAmountButton\":\"Set Amount\"}},\"settings\":{\"saveChanges\":\"Save Changes\",\"savePreferences\":\"Save Preferences\",\"account\":{\"title\":\"Account\"},\"profile\":{\"title\":\"Edit Profile\",\"description\":\"Update your personal information.\",\"toastSuccess\":\"Your profile has been updated.\",\"form\":{\"nameLabel\":\"Full Name\",\"namePlaceholder\":\"Your Name\"},\"editButton\":\"Edit Profile\"},\"preferences\":{\"title\":\"Preferences\"},\"security\":{\"title\":\"Security\"},\"language\":{\"title\":\"Language\",\"description\":\"Choose your preferred language for the app.\",\"selectLabel\":\"Select Language\",\"selectPlaceholder\":\"Select a language\"},\"password\":{\"title\":\"Change Password\",\"description\":\"Choose a new, strong password for your account.\",\"notLoggedInError\":\"You must be logged in to change your password.\",\"toastSuccess\":\"Your password has been changed successfully.\",\"toastErrorTitle\":\"Error updating password\",\"form\":{\"newPasswordLabel\":\"New Password\",\"confirmPasswordLabel\":\"Confirm New Password\"},\"updateButton\":\"Update Password\"},\"notifications\":{\"title\":\"Notifications\",\"description\":\"Manage how you receive notifications from us.\",\"toastSuccess\":\"Your notification preferences have been updated.\",\"depositsLabel\":\"Deposits & Transfers\",\"depositsDescription\":\"Receive a notification when you get paid.\",\"alertsLabel\":\"Security & Balance Alerts\",\"alertsDescription\":\"Get alerts for low balances or suspicious activity.\",\"infoLabel\":\"Feature Announcements\",\"infoDescription\":\"Find out about new features and updates.\"}},\"notifications\":{\"title\":\"Notifications\",\"noNotifications\":\"You have no notifications.\",\"justNow\":\"just now\"},\"login\":{\"title\":\"Welcome Back\",\"description\":\"Log in to access your FinSim account.\",\"failTitle\":\"Login Failed\",\"invalidCredentials\":\"Invalid email or password. Please try again.\",\"button\":\"Log In\",\"noAccount\":\"Don't have an account?\",\"signUpLink\":\"Sign up\",\"forgotPasswordLink\":\"Forgot your password?\"},\"signup\":{\"title\":\"Create an Account\",\"description\":\"Join FinSim today to start managing your finances.\",\"failTitle\":\"Signup Failed\",\"emailInUseError\":\"This email address is already in use. Please try another one.\",\"firstNameLabel\":\"First Name\",\"firstNamePlaceholder\":\"John\",\"lastNameLabel\":\"Last Name\",\"lastNamePlaceholder\":\"Doe\",\"initialBalanceLabel\":\"Initial Balance\",\"createAccountButton\":\"Create Account\",\"alreadyHaveAccount\":\"Already have an account?\",\"loginLink\":\"Log in\",\"toastSuccessTitle\":\"Account Created!\",\"toastSuccessDescription\":\"You have been successfully signed up. Please log in.\"},\"forgotPassword\":{\"title\":\"Forgot Password\",\"description\":\"Enter your email to receive a password reset link.\",\"descriptionSent\":\"Follow the instructions sent to your email to reset your password.\",\"successMessage\":\"If an account exists for this email, a password reset link has been sent.\",\"emailSentTitle\":\"Email Sent\",\"sendLinkButton\":\"Send Reset Link\",\"backToLogin\":\"Back to Login\"},\"email\":\"Email\",\"password\":\"Password\",\"transfer\":{\"title\":\"Transfer\",\"description\":\"Send & Request Funds\"}}"));}}),
"[project]/src/lang/km.json (json)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v(JSON.parse("{\"logout\":\"ចេញពីប្រព័ន្ធ\",\"error\":\"កំហុស\",\"success\":\"ជោគជ័យ\",\"cancel\":\"បោះបង់\",\"reset\":\"កំណត់ឡើងវិញ\",\"share\":\"ចែករំលែក\",\"amount\":\"ចំនួនទឹកប្រាក់\",\"recipient\":\"អ្នកទទួល\",\"pending\":\"រង់ចាំ\",\"searching\":\"កំពុង​ស្វែងរក\",\"firebase\":{\"notConfigured\":\"Firebase មិនត្រូវបានកំណត់រចនាសម្ព័ន្ធទេ។ សូមពិនិត្យមើលអថេរបរិស្ថានរបស់អ្នក។\"},\"nav\":{\"dashboard\":\"ទំព័រដើម\",\"settings\":\"ការកំណត់\"},\"account\":{\"copied\":\"បានចម្លង!\",\"copiedDescription\":\"លេខគណនីបានចម្លងទៅក្ដារតម្បៀតខ្ទាស់។\",\"accountNumber\":\"លេខគណនី\",\"availableBalance\":\"សមតុល្យដែលអាចប្រើបាន\",\"checkingBalance\":\"សមតុល្យគណនីចរន្ត\",\"account\":\"គណនី\"},\"dashboard\":{\"greeting\":\"សួស្តី, {{name}}\",\"welcomeMessage\":\"តើ​អ្នក​ចង់​ធ្វើអ្វី​នៅ​ថ្ងៃនេះ?\",\"spending\":{\"title\":\"សង្ខេបការចំណាយ\",\"description\":\"ការបំបែកការចំណាយរបស់អ្នកតាមប្រភេទ។\",\"noData\":\"គ្មានទិន្នន័យចំណាយដើម្បីបង្ហាញទេ។\",\"general\":\"ទូទៅ\",\"transfers\":\"ការផ្ទេរ\",\"dining\":\"អាហារ\",\"groceries\":\"គ្រឿងទេស\",\"transport\":\"ការដឹកជញ្ជូន\"},\"history\":{\"title\":\"ប្រតិបត្តិការថ្មីៗ\",\"viewAll\":\"មើល​ទាំងអស់\"},\"myQr\":{\"title\":\"QR កូដរបស់ខ្ញុំ\",\"description\":\"បង្ហាញ QR របស់អ្នកដើម្បីទទួលប្រាក់។\"},\"scanQr\":{\"title\":\"ស្កេនដើម្បីបង់ប្រាក់\",\"description\":\"បង់ប្រាក់ដោយស្កេន QR កូដ។\"},\"historyCard\":{\"title\":\"ប្រវត្តិប្រតិបត្តិការ\",\"description\":\"មើលប្រតិបត្តិការកន្លងមករបស់អ្នកទាំងអស់។\"}},\"transactionForm\":{\"title\":\"ប្រតិបត្តិការថ្មី\",\"description\":\"ផ្ញើប្រាក់ដោយប្រើលេខគណនី 9 ខ្ទង់។\",\"recipientLabel\":\"គណនីអ្នកទទួល #\",\"recipientPlaceholder\":\"ឧ., 001-002-003\",\"recipientNotFound\":\"រកមិនឃើញគណនី\",\"errorFindingAccount\":\"មានកំហុសក្នុងការស្វែងរកគណនី\",\"descriptionLabel\":\"ការពិពណ៌នា\",\"descriptionPlaceholder\":\"ឧ., អាហារពេលល្ងាចជាមួយមិត្តភក្តិ\",\"submitButton\":\"បញ្ជូនប្រតិបត្តិការ\"},\"transactions\":{\"title\":\"ប្រវត្តិប្រតិបត្តិការពេញលេញ\",\"description\":\"កំណត់ត្រានៃសកម្មភាពគណនីរបស់អ្នកទាំងអស់។\",\"recentDescription\":\"ប្រតិបត្តិការថ្មីៗ {{count}} របស់អ្នក។\",\"noTransactions\":\"រកមិនឃើញប្រតិបត្តិការទេ។\",\"filter\":{\"typePlaceholder\":\"ត្រងតាមប្រភេទ\",\"allTypes\":\"គ្រប់ប្រភេទ\",\"deposit\":\"ប្រាក់បញ្ញើ\",\"withdrawal\":\"ការដកប្រាក់\",\"datePlaceholder\":\"ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ\",\"resetTitle\":\"កំណត់តម្រងឡើងវិញ\"},\"table\":{\"description\":\"ការពិពណ៌នា\",\"date\":\"កាលបរិច្ឆេទ\",\"type\":\"ប្រភេទ\",\"amount\":\"ចំនួនទឹកប្រាក់\"},\"types\":{\"deposit\":\"ប្រាក់បញ្ញើ\",\"withdrawal\":\"ការដកប្រាក់\"}},\"quickpay\":{\"title\":\"ទូទាត់រហ័ស\",\"description\":\"ផ្ញើប្រាក់ទៅកាន់ទំនាក់ទំនងញឹកញាប់របស់អ្នក។\",\"noRecipients\":\"នៅពេលដែលអ្នកធ្វើប្រតិបត្តិការមួយចំនួន ទំនាក់ទំនងញឹកញាប់របស់អ្នកនឹងបង្ហាញនៅទីនេះ។\",\"dialog\":{\"title\":\"បង់ប្រាក់ឱ្យ {{name}}\",\"description\":\"បញ្ជាក់ព័ត៌មានលម្អិតដើម្បីផ្ញើការទូទាត់របស់អ្នកយ៉ាងរហ័ស។\",\"sendButton\":\"ផ្ញើការទូទាត់\"}},\"qrpay\":{\"title\":\"ស្កេនដើម្បីបង់ប្រាក់\",\"cameraError\":\"ត្រូវការការចូលប្រើកាមេរ៉ា។ សូមបើកការអនុញ្ញាតកាមេរ៉ានៅក្នុងការកំណត់កម្មវិធីរុករករបស់អ្នក។\",\"invalidQrFormat\":\"ទម្រង់ QR កូដមិនត្រឹមត្រូវ។ រំពឹងទុកអ្នកទទួល។\",\"qrParseError\":\"បរាជ័យក្នុងការញែកទិន្នន័យ QR កូដ។ សូមប្រើ QR កូដទូទាត់ត្រឹមត្រូវ។\",\"flashError\":{\"title\":\"កំហុសអំពូលភ្លើង\",\"description\":\"មិនអាចបិទបើកអំពូលភ្លើងបានទេ។\"},\"import\":{\"failTitle\":\"ការស្កេនបានបរាជ័យ\",\"failDescription\":\"រកមិនឃើញ QR កូដនៅក្នុងរូបភាពដែលបានជ្រើសរើសទេ។\",\"buttonTitle\":\"នាំចូល QR កូដពីរូបភាព\"},\"paymentSuccess\":{\"title\":\"ការទូទាត់បានជោគជ័យ\",\"description\":\"អ្នកបានបង់ប្រាក់ {{amount}} ទៅ {{recipient}}។\"},\"paymentError\":{\"unexpected\":\"មានកំហុសដែលមិនបានរំពឹងទុកកើតឡើងកំឡុងពេលទូទាត់។\"},\"analysisError\":{\"title\":\"មិនអាចវិភាគប្រតិបត្តិការបានទេ\",\"description\":\"បន្តការទូទាត់ ប៉ុន្តែសូមប្រយ័ត្ន។\"},\"confirmPaymentButton\":\"បញ្ជាក់ការទូទាត់\",\"status\":{\"completed\":\"ការទូទាត់បានបញ្ចប់ដោយជោគជ័យ។\",\"confirmDetails\":\"បញ្ជាក់ព័ត៌មានលម្អិតអំពីការទូទាត់របស់អ្នក។\",\"positionQr\":\"ដាក់ QR កូដនៅខាងក្នុងស៊ុម។\"},\"cameraDenied\":\"ការចូលប្រើកាមេរ៉ាត្រូវបានបដិសេធ។ សូមបើកវានៅក្នុងការកំណត់កម្មវិធីរុករករបស់អ្នក។\",\"flashButtonTitle\":\"បិទបើកអំពូលភ្លើង\",\"paymentComplete\":{\"title\":\"ការទូទាត់បានបញ្ចប់!\",\"description\":\"អ្នកបានបង់ប្រាក់ ${{amount}} ដោយជោគជ័យទៅ {{recipient}}។\"},\"scanAnotherButton\":\"ស្កេនកូដមួយទៀត\",\"paymentDetails\":\"ព័ត៌មានលម្អិតអំពីការទូទាត់\",\"setAmountButton\":\"កំណត់ចំនួនទឹកប្រាក់\"},\"myqr\":{\"title\":\"ទទួលការទូទាត់\",\"description\":\"ចែករំលែក QR កូដនេះដើម្បីទទួលបានការទូទាត់។ អ្នកអាចបន្ថែមចំនួនទឹកប្រាក់ខាងក្រោម។\",\"requesting\":\"កំពុងស្នើសុំ\",\"requestingPayment\":\"កំពុងស្នើសុំការទូទាត់\",\"to\":\"ទៅ\",\"scanToPay\":\"ស្កេនដើម្បីបង់ប្រាក់ឱ្យ {{name}}\",\"share\":{\"withAmount\":\"នេះគឺជាកូដ QR ទូទាត់របស់ខ្ញុំដើម្បីទទួលបាន ${{amount}} ពី {{name}}។\",\"withoutAmount\":\"នេះគឺជាកូដ QR ទូទាត់របស់ខ្ញុំដើម្បីទទួលបានប្រាក់ពី {{name}}។\",\"title\":\"សំណើទូទាត់ FinSim\",\"errorTitle\":\"ការចែករំលែកបានបរាជ័យ\",\"errorDescription\":\"មិនអាចចែករំលែក QR កូដបានទេ។\",\"notSupportedTitle\":\"ការចែករំលែកមិនត្រូវបានគាំទ្រទេ\",\"notSupportedDescription\":\"កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រ Web Share API ទេ។\"},\"save\":{\"button\":\"រក្សាទុក QR កូដ\",\"errorTitle\":\"ការរក្សាទុកបានបរាជ័យ\",\"errorNotReady\":\"ទិន្នន័យ QR កូដមិនទាន់រួចរាល់ទេ។\",\"errorNoCanvas\":\"រកមិនឃើញផ្ទាំងក្រណាត់ QR កូដដើម្បីរក្សាទុកទេ។\",\"errorCreateImage\":\"មិនអាចបង្កើតរូបភាពបានទេ។\",\"successTitle\":\"QR កូដបានរក្សាទុក\",\"successDescription\":\"QR កូដផ្ទាល់ខ្លួនរបស់អ្នកត្រូវបានទាញយក។\"},\"form\":{\"amountLabel\":\"ចំនួនទឹកប្រាក់ជាក់លាក់ (ស្រេចចិត្ត)\",\"setAmountButton\":\"កំណត់ចំនួនទឹកប្រាក់\"}},\"settings\":{\"saveChanges\":\"រក្សាទុកការផ្លាស់ប្តូរ\",\"savePreferences\":\"រក្សាទុកចំណូលចិត្ត\",\"account\":{\"title\":\"គណនី\"},\"profile\":{\"title\":\"កែសម្រួលប្រវត្តិរូប\",\"description\":\"ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។\",\"toastSuccess\":\"ប្រវត្តិរូបរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាព។\",\"form\":{\"nameLabel\":\"ឈ្មោះ​ពេញ\",\"namePlaceholder\":\"ឈ្មោះ​របស់​អ្នក\"},\"editButton\":\"កែសម្រួលប្រវត្តិរូប\"},\"preferences\":{\"title\":\"ចំណូលចិត្ត\"},\"security\":{\"title\":\"សុវត្ថិភាព\"},\"language\":{\"title\":\"ភាសា\",\"description\":\"ជ្រើសរើសភាសាដែលអ្នកពេញចិត្តសម្រាប់កម្មវិធី។\",\"selectLabel\":\"ជ្រើសរើសភាសា\",\"selectPlaceholder\":\"ជ្រើសរើសភាសា\"},\"password\":{\"title\":\"ផ្លាស់ប្តូរពាក្យសម្ងាត់\",\"description\":\"ជ្រើសរើសពាក្យសម្ងាត់ថ្មីដែលរឹងមាំសម្រាប់គណនីរបស់អ្នក។\",\"notLoggedInError\":\"អ្នកត្រូវតែចូលដើម្បីផ្លាស់ប្តូរពាក្យសម្ងាត់របស់អ្នក។\",\"toastSuccess\":\"ពាក្យសម្ងាត់របស់អ្នកត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ។\",\"toastErrorTitle\":\"កំហុសក្នុងការធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់\",\"form\":{\"newPasswordLabel\":\"ពាក្យសម្ងាត់​ថ្មី\",\"confirmPasswordLabel\":\"បញ្ជាក់ពាក្យសម្ងាត់ថ្មី\"},\"updateButton\":\"ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់\"},\"notifications\":{\"title\":\"ការជូនដំណឹង\",\"description\":\"គ្រប់គ្រងរបៀបដែលអ្នកទទួលបានការជូនដំណឹងពីយើង។\",\"toastSuccess\":\"ចំណូលចិត្តការជូនដំណឹងរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាព។\",\"depositsLabel\":\"ប្រាក់បញ្ញើ និងការផ្ទេរ\",\"depositsDescription\":\"ទទួលបានការជូនដំណឹងនៅពេលអ្នកទទួលបានប្រាក់ខែ។\",\"alertsLabel\":\"ការជូនដំណឹងអំពីសុវត្ថិភាព និងសមតុល្យ\",\"alertsDescription\":\"ទទួលបានការជូនដំណឹងសម្រាប់សមតុល្យទាប ឬសកម្មភាពគួរឱ្យសង្ស័យ។\",\"infoLabel\":\"ការប្រកាសអំពីមុខងារ\",\"infoDescription\":\"ស្វែងយល់អំពីមុខងារ និងការអាប់ដេតថ្មីៗ។\"}},\"notifications\":{\"title\":\"ការជូនដំណឹង\",\"noNotifications\":\"អ្នកមិនមានការជូនដំណឹងទេ។\",\"justNow\":\"ឥឡូវនេះ\"},\"login\":{\"title\":\"សូមស្វាគមន៍មកកាន់\",\"description\":\"ចូលដើម្បីចូលប្រើគណនី FinSim របស់អ្នក។\",\"failTitle\":\"ការចូលបានបរាជ័យ\",\"invalidCredentials\":\"អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ សូម​ព្យាយាម​ម្តង​ទៀត។\",\"button\":\"ចូល\",\"noAccount\":\"មិនមានគណនីមែនទេ?\",\"signUpLink\":\"ចុះ​ឈ្មោះ\",\"forgotPasswordLink\":\"ភ្លេច​លេខសំងាត់​របស់​អ្នក?\"},\"signup\":{\"title\":\"បង្កើត​គណនី\",\"description\":\"ចូលរួមជាមួយ FinSim ថ្ងៃនេះដើម្បីចាប់ផ្តើមគ្រប់គ្រងហិរញ្ញវត្ថុរបស់អ្នក។\",\"failTitle\":\"ការចុះឈ្មោះបានបរាជ័យ\",\"emailInUseError\":\"អាសយដ្ឋានអ៊ីមែលនេះកំពុងប្រើប្រាស់រួចហើយ។ សូម​សាកល្បង​មួយ​ផ្សេង​ទៀត។\",\"firstNameLabel\":\"នាមខ្លួន\",\"firstNamePlaceholder\":\"សុខ\",\"lastNameLabel\":\"នាមត្រកូល\",\"lastNamePlaceholder\":\"ចាន់\",\"initialBalanceLabel\":\"សមតុល្យដំបូង\",\"createAccountButton\":\"បង្កើត​គណនី\",\"alreadyHaveAccount\":\"មានគណនីហើយ?\",\"loginLink\":\"ចូល\",\"toastSuccessTitle\":\"គណនីបានបង្កើត!\",\"toastSuccessDescription\":\"អ្នកបានចុះឈ្មោះដោយជោគជ័យ។ សូមចូល។\"},\"forgotPassword\":{\"title\":\"ភ្លេច​លេខសំងាត់\",\"description\":\"បញ្ចូលអ៊ីមែលរបស់អ្នកដើម្បីទទួលបានតំណកំណត់ពាក្យសម្ងាត់ឡើងវិញ។\",\"descriptionSent\":\"អនុវត្តតាមការណែនាំដែលបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក ដើម្បីកំណត់ពាក្យសម្ងាត់របស់អ្នកឡើងវិញ។\",\"successMessage\":\"ប្រសិនបើមានគណនីសម្រាប់អ៊ីមែលនេះ តំណកំណត់ពាក្យសម្ងាត់ឡើងវិញត្រូវបានផ្ញើ។\",\"emailSentTitle\":\"អ៊ីមែលបានផ្ញើ\",\"sendLinkButton\":\"ផ្ញើតំណកំណត់ឡើងវិញ\",\"backToLogin\":\"ត្រលប់ទៅការចូល\"},\"email\":\"អ៊ីមែល\",\"password\":\"ពាក្យសម្ងាត់\",\"transfer\":{\"title\":\"ផ្ទេរប្រាក់\",\"description\":\"ផ្ញើ និងស្នើសុំមូលនិធិ\"}}"));}}),
"[project]/src/hooks/use-translation.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "LanguageProvider": (()=>LanguageProvider),
    "useTranslation": (()=>useTranslation)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$local$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-local-storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lang$2f$en$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/lang/en.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lang$2f$km$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/lang/km.json (json)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const translations = {
    en: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lang$2f$en$2e$json__$28$json$29$__["default"],
    km: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lang$2f$km$2e$json__$28$json$29$__["default"]
};
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const LanguageProvider = ({ children })=>{
    _s();
    const [storedLanguage, setStoredLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$local$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocalStorage"])('language', 'km');
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(storedLanguage);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
            setLanguage(storedLanguage);
            document.documentElement.lang = storedLanguage;
            if (storedLanguage === 'km') {
                document.body.classList.add('font-khmer');
            } else {
                document.body.classList.remove('font-khmer');
            }
        }
    }["LanguageProvider.useEffect"], [
        storedLanguage
    ]);
    const setLanguageAndStore = (lang)=>{
        setLanguage(lang);
        setStoredLanguage(lang);
    };
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LanguageProvider.useMemo[t]": ()=>({
                "LanguageProvider.useMemo[t]": (key, options)=>{
                    const keys = key.split('.');
                    let result = translations[language];
                    for (const k of keys){
                        result = result?.[k];
                        if (result === undefined) {
                            // Fallback to English if translation is missing
                            let fallbackResult = translations.en;
                            for (const fk of keys){
                                fallbackResult = fallbackResult?.[fk];
                                if (fallbackResult === undefined) return key;
                            }
                            result = fallbackResult;
                            break;
                        }
                    }
                    if (typeof result !== 'string') return key;
                    if (options) {
                        result = Object.entries(options).reduce({
                            "LanguageProvider.useMemo[t]": (acc, [optKey, optValue])=>{
                                return acc.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optValue));
                            }
                        }["LanguageProvider.useMemo[t]"], result);
                    }
                    return result;
                }
            })["LanguageProvider.useMemo[t]"]
    }["LanguageProvider.useMemo[t]"], [
        language
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage: setLanguageAndStore,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/hooks/use-translation.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
};
_s(LanguageProvider, "4ywcIDh4Q7tzyD4egiNsA1bOZ3o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$local$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocalStorage"]
    ];
});
_c = LanguageProvider;
const useTranslation = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
_s1(useTranslation, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_c68a9d07._.js.map