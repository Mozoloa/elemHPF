#include "PluginProcessor.h"
#include "WebViewEditor.h"
#include <juce_core/juce_core.h>
#include <juce_data_structures/juce_data_structures.h>

// A helper for reading numbers from a choc::Value, which seems to opportunistically parse
// JSON numbers into ints or 32-bit floats whenever it wants.
double numberFromChocValue(const choc::value::ValueView &v)
{
    return (
        v.isFloat32() ? (double)v.getFloat32()
                      : (v.isFloat64() ? v.getFloat64()
                                       : (v.isInt32() ? (double)v.getInt32()
                                                      : (double)v.getInt64())));
}

std::string getMimeType(std::string const &ext)
{
    static std::unordered_map<std::string, std::string> mimeTypes{
        {".html", "text/html"},
        {".js", "application/javascript"},
        {".css", "text/css"},
    };

    if (mimeTypes.count(ext) > 0)
        return mimeTypes.at(ext);

    return "application/octet-stream";
}

// NEW: Helper to dispatch a JS event
void dispatchEvent(choc::ui::WebView *webView, const std::string &eventName, const std::string &jsonDetail)
{
    std::string js = "console.log('" + eventName + " event:', " + jsonDetail + ");"
                                                                               "window.dispatchEvent(new CustomEvent('" +
                     eventName + "', { detail: " + jsonDetail + " }));";
    webView->evaluateJavascript(js);
}

//==============================================================================
WebViewEditor::WebViewEditor(juce::AudioProcessor *proc, juce::File const &assetDirectory, int width, int height)
    : juce::AudioProcessorEditor(proc)
{
    setSize(600, 480);

    choc::ui::WebView::Options opts;

#if JUCE_DEBUG
    opts.enableDebugMode = true;
#endif

#if !ELEM_DEV_LOCALHOST
    opts.fetchResource = [=](const choc::ui::WebView::Options::Path &p) -> std::optional<choc::ui::WebView::Options::Resource>
    {
        auto relPath = "." + (p == "/" ? "/index.html" : p);
        auto f = assetDirectory.getChildFile(relPath);
        juce::MemoryBlock mb;

        if (!f.existsAsFile() || !f.loadFileAsData(mb))
            return {};

        return choc::ui::WebView::Options::Resource{
            std::vector<uint8_t>(mb.begin(), mb.end()),
            getMimeType(f.getFileExtension().toStdString())};
    };
#endif

    webView = std::make_unique<choc::ui::WebView>(opts);

#if JUCE_MAC
    viewContainer.setView(webView->getViewHandle());
#elif JUCE_WINDOWS
    viewContainer.setHWND(webView->getViewHandle());
#else
#error "We only support MacOS and Windows here yet."
#endif

    addAndMakeVisible(viewContainer);
    viewContainer.setBounds({0, 0, 600, 480});

    // Install message passing handlers
    webView->bind("__postNativeMessage__", [=](const choc::value::ValueView &args) -> choc::value::Value
                  {
        if (args.isArray()) {
            auto eventName = args[0].getString();

            // When the webView loads it should send a message telling us that it has established
            // its message-passing hooks and is ready for a state dispatch
            if (eventName == "ready") {
                if (auto* ptr = dynamic_cast<EffectsPluginProcessor*>(getAudioProcessor())) {
                    ptr->dispatchStateChange();
                }
            }

#if ELEM_DEV_LOCALHOST
            if (eventName == "reload") {
                if (auto* ptr = dynamic_cast<EffectsPluginProcessor*>(getAudioProcessor())) {
                    ptr->initJavaScriptEngine();
                    ptr->dispatchStateChange();
                }
            }
#endif

            if (eventName == "setParameterValue") {
                jassert(args.size() > 1);
                return handleSetParameterValueEvent(args[1]);
            }
        }

        return {}; });

#if ELEM_DEV_LOCALHOST
    webView->navigate("http://localhost:5173");
#endif
}

choc::ui::WebView *WebViewEditor::getWebViewPtr()
{
    return webView.get();
}

void WebViewEditor::paint(juce::Graphics &g)
{
}

void WebViewEditor::resized()
{
    viewContainer.setBounds(getLocalBounds());
}

//==============================================================================
choc::value::Value WebViewEditor::handleSetParameterValueEvent(const choc::value::ValueView &e)
{
    // When setting a parameter value, we simply tell the host. This will in turn fire
    // a parameterValueChanged event, which will catch and propagate through dispatching
    // a state change event
    if (e.isObject() && e.hasObjectMember("paramId") && e.hasObjectMember("value"))
    {
        auto const &paramId = e[std::string("paramId")].getString();
        double const v = numberFromChocValue(e[std::string("value")]);

        for (auto &p : getAudioProcessor()->getParameters())
        {
            if (auto *pf = dynamic_cast<juce::AudioParameterFloat *>(p))
            {
                if (pf->paramID.toStdString() == paramId)
                {
                    pf->setValueNotifyingHost(v);
                    break;
                }
            }
        }
    }

    return choc::value::Value();
}
